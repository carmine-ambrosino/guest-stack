import re
import secrets
import string
import logging
from datetime import datetime, timezone
from app.openstack_client import get_keystone_client
from app.db.db import get_db_connection

class UserManager:
    EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$")

    def __init__(self, auth_url, username, password, user_domain_name, project_name, project_domain_name):
        self.keystone = get_keystone_client(
            auth_url, username, password, user_domain_name, project_name, project_domain_name
        )

    @staticmethod
    def validate_email(email):
        if not UserManager.EMAIL_REGEX.match(email):
            return {"error": "Invalid email format"}, 400

    @staticmethod
    def validate_username(username):
        if not username or len(username) < 3:
            return {"error": "Username must be at least 3 characters long"}, 400

    @staticmethod
    def validate_expiry_time(expiry_time):
        try:
            datetime.fromisoformat(expiry_time)
        except ValueError:
            return {"error": "Invalid expiry_time format. Must be ISO 8601."}, 400

    @staticmethod
    def validate_project(project, keystone):
        try:
            keystone.projects.find(name=project)
        except Exception:
            return {"error": f"Project '{project}' not found"}, 404

    @staticmethod
    def validate_role(role, keystone):
        try:
            keystone.roles.find(name=role)
        except Exception:
            return {"error": f"Role '{role}' not found"}, 404

    @staticmethod
    def generate_random_password(length=20):
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(secrets.choice(characters) for _ in range(length))

    @staticmethod
    def is_valid_user_id(user_id):
        try:
            user_id = int(user_id)
            return user_id > 0, user_id
        except (ValueError, TypeError):
            return False, None


    def create_user(self, username, expiry_time, email, project, role):
        validators = [
            lambda: self.validate_username(username),
            lambda: self.validate_email(email),
            lambda: self.validate_expiry_time(expiry_time),
            lambda: self.validate_project(project, self.keystone),
            lambda: self.validate_role(role, self.keystone),
        ]

        for validate in validators:
            error = validate()
            if error:
                return error

        expiry_time_utc = datetime.fromisoformat(expiry_time).astimezone(timezone.utc)
        password = self.generate_random_password()

        try:
            project_obj = self.keystone.projects.find(name=project)
            role_obj = self.keystone.roles.find(name=role)
            user = self.keystone.users.create(
                name=username,
                password=password,
                email=email,
                description=f"Temporary user expiring on {expiry_time_utc.isoformat()}",
                enabled=True,
            )
            self.keystone.roles.grant(role=role_obj, user=user, project=project_obj)

            with get_db_connection() as conn:
                conn.execute(
                    """
                    INSERT INTO temporary_users 
                    (username, expiry_time, email, openstack_user_id, project_id, project_name, role) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (username, expiry_time_utc.isoformat(), email, user.id, project_obj.id, project_obj.name, role),
                )
                conn.commit()

            # Password Log
            logging.info("----------------------------------------------------------------")
            logging.info(f"Generated password for user {username}: {password}")
            logging.info("----------------------------------------------------------------")
            
            return {"message": "User created", "openstack_id": user.id}, 201
        except Exception as e:
            logging.error(f"Error creating user: {e}")
            return {"error": "An internal error occurred", "details": str(e)}, 500

        expiry_time_utc = datetime.fromisoformat(expiry_time).astimezone(timezone.utc)

        conn.execute(
            "UPDATE temporary_users SET expiry_time = ? WHERE openstack_user_id = ?",
            (expiry_time_utc.isoformat(), user_id)
        )

        user = self.keystone.users.get(user_id)
        self.keystone.users.update(
            user, description=f"Temporary user expiring on {expiry_time_utc.isoformat()}"
        )

    def get_temp_users(self):
        with get_db_connection() as conn:
            users = conn.execute("SELECT * FROM temporary_users").fetchall()
        return [dict(user) for user in users]

    def get_temp_users_by_id(self, user_id):
        is_valid, user_id = self.is_valid_user_id(user_id)
        if not is_valid:
            return {"error": "Invalid user ID"}, 400
        with get_db_connection() as conn:
            user = conn.execute("SELECT * FROM temporary_users WHERE id = ?", (user_id,)).fetchone()
        return dict(user) if user else None


    def delete_user(self, user_id):
        is_valid, user_id = self.is_valid_user_id(user_id)
        if not is_valid:
            return {"error": "Invalid user ID"}, 400

        with get_db_connection() as conn:
            user = conn.execute("SELECT * FROM temporary_users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                return {"error": "User not found in the database"}, 404

            try:
                self.keystone.users.delete(user["openstack_user_id"])
                conn.execute("DELETE FROM temporary_users WHERE id = ?", (user_id,))
                conn.commit()
                return {"message": "User deleted successfully"}, 200
            except Exception as e:
                logging.error(f"Error deleting user: {e}")
                return {"error": "An error occurred while deleting the user"}, 500

    def _update_email(self, conn, user_id, email):
        
        conn.execute(
            "UPDATE temporary_users SET email = ? WHERE openstack_user_id = ?",
            (email, user_id)
        )

        user = self.keystone.users.get(user_id)
        self.keystone.users.update(user, email=email)

    def _update_role(self, conn, user_id, role_name, project_id):
        role = self.keystone.roles.find(name=role_name)

        user = self.keystone.users.get(user_id)
        project = self.keystone.projects.get(project_id)

        current_roles = self.keystone.roles.list(user=user, project=project)
        for current_role in current_roles:
            self.keystone.roles.revoke(role=current_role, user=user, project=project)

        self.keystone.roles.grant(role=role, user=user, project=project)

        conn.execute(
            "UPDATE temporary_users SET role = ? WHERE openstack_user_id = ?",
            (role_name, user_id)
        )


    def _update_project_and_role(self, conn, user_id, project_name, role_name=None):
        try:
            project = self.keystone.projects.find(name=project_name)
        except Exception:
            raise ValueError(f"Project '{project_name}' not found")

        conn.execute(
            "UPDATE temporary_users SET project_id = ?, project_name = ? WHERE openstack_user_id = ?",
            (project.id, project_name, user_id)
        )

        user = self.keystone.users.get(user_id)

        self.keystone.users.update(user=user, default_project=project)

        all_projects = self.keystone.projects.list(user=user)
        for other_project in all_projects:
            if other_project.id != project.id:  
                current_roles = self.keystone.roles.list(user=user, project=other_project)
                for role in current_roles:
                    self.keystone.roles.revoke(role=role, user=user, project=other_project)

        if not role_name:
            role_name = conn.execute(
                "SELECT role FROM temporary_users WHERE openstack_user_id = ?",
                (user_id,)
            ).fetchone()[0]

        self._update_role(conn, user_id, role_name, project.id)


    def _update_expiry_time(self, conn, user_id, expiry_time):
        """
        Update expiry time and description
        """

        self.validate_expiry_time(expiry_time)

        conn.execute(
            "UPDATE temporary_users SET expiry_time = ? WHERE openstack_user_id = ?",
            (expiry_time, user_id)
        )

        expiry_time_utc = datetime.fromisoformat(expiry_time).astimezone(timezone.utc)

        user = self.keystone.users.get(user_id)

        # update description
        self.keystone.users.update(
            user, description=f"Temporary user expiring on {expiry_time_utc.isoformat()}"
        )


    def update_user(self, user_id, email=None, project=None, role=None, expiry_time=None):
        is_valid, user_id = self.is_valid_user_id(user_id)
        if not is_valid:
            return {"error": "Invalid user ID"}, 400

        with get_db_connection() as conn:
            user = conn.execute(
                "SELECT * FROM temporary_users WHERE id = ?",
                (user_id,)
            ).fetchone()

            if not user:
                return {"error": "User not found in the database"}, 404

            try:
                if email:
                    self._update_email(conn, user["openstack_user_id"], email)

                if project:
                    self._update_project_and_role(conn, user["openstack_user_id"], project, role)

                if expiry_time:
                    self._update_expiry_time(conn, user["openstack_user_id"], expiry_time)

                conn.commit()
                return {"message": "User updated successfully"}, 200

            except Exception as e:
                conn.rollback()
                return {"error": f"Failed to update user: {str(e)}"}, 400

    def load_users(self):
        try:
            users = self.get_temp_users()
        except Exception as e:
            logging.info(f"Error fetch temp users: {e}")
            return []

        if not users:
            logging.info("No temp user.")
            return []

        for user in users:
            temp_user_id = user.get('id')
            keystone_user_id = user.get('openstack_user_id')

            if not temp_user_id or not keystone_user_id:
                logging.info(f"Missing ID: {user}")
                continue

            self._synchronize_user_with_keystone(user, temp_user_id, keystone_user_id)

        return [dict(user) for user in users]

    def _synchronize_user_with_keystone(self, user, temp_user_id, keystone_user_id):
        try:
            keystone_user = self._fetch_keystone_user(keystone_user_id)
        except Exception as e:
            logging.info(f"Error fetch user with {keystone_user_id} from Keystone: {e}")
            return

        update_needed = False

        update_needed |= self._update_user_email_if_needed(user, keystone_user)
        update_needed |= self._update_user_project_if_needed(user, keystone_user)
        update_needed |= self._update_user_username_if_needed(user, keystone_user)

        if update_needed:
            self._persist_user_updates(user, temp_user_id)

    def _fetch_keystone_user(self, keystone_user_id):
        try:
            return self.keystone.users.get(keystone_user_id)
        except KeyError:
            logging.info(f"User with OpenStack ID {keystone_user_id} not found in Keystone.")
            raise

    def _update_user_email_if_needed(self, user, keystone_user):
        if keystone_user.email and keystone_user.email != user.get('email'):
            logging.info(
                f"Update email for user with OpenStack ID {keystone_user.id}: "
                f"{keystone_user.email} -> {user.get('email')}"
            )
            user['email'] = keystone_user.email
            return True
        return False

    def _update_user_project_if_needed(self, user, keystone_user):
            keystone_project_id = getattr(keystone_user, 'default_project_id', None)
            keystone_project_name = None

            if keystone_project_id:
                try:
                    keystone_project = self.keystone.projects.get(keystone_project_id)
                    keystone_project_name = keystone_project.name
                except Exception as e:
                    logging.info(f"Error fetch project ID {keystone_project_id}: {e}")

            if keystone_project_name and (
                keystone_project_name != user.get('project_name') or
                keystone_project_id != user.get('project_id')
            ):
                logging.info(
                    f"Update project for user with OpenStack ID {keystone_user.id}: "
                    f"{keystone_project_name} ({keystone_project_id}) -> "
                    f"{user.get('project_name')} ({user.get('project_id')})"
                )
                user['project_name'] = keystone_project_name
                user['project_id'] = keystone_project_id
                return True

            return False
 
    def _update_user_username_if_needed(self, user, keystone_user):
        if keystone_user.name and keystone_user.name != user.get('username'):
            logging.info(
                f"Update username user with OpenStack ID {keystone_user.id}: "
                f"{keystone_user.name} -> {user.get('username')}"
            )
            user['username'] = keystone_user.name
            return True
        return False

    def _persist_user_updates(self, user, temp_user_id):
        try:
            with get_db_connection() as conn:
                conn.execute(
                    """
                    UPDATE temporary_users
                    SET email = ?, project_name = ?, project_id = ?, username = ?
                    WHERE id = ?
                    """,
                    (
                        user['email'],
                        user['project_name'] or "Unknown Project",
                        user['project_id'],
                        user['username'],
                        temp_user_id,
                    ),
                )
                conn.commit()
        except Exception as e:
            logging.info(f"Error during save user with ID {temp_user_id}: {e}")


