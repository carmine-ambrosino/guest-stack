import re
import secrets
import string
import logging
from datetime import datetime, timezone
from backend.openstack_client import get_keystone_client
from backend.db.db import get_db_connection

class UserManager:
    EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$")

    def __init__(self, auth_url, username, password, user_domain_name, project_name, project_domain_name):
        self.keystone = get_keystone_client(
            auth_url, username, password, user_domain_name, project_name, project_domain_name
        )

    @staticmethod
    def validate_email(email):
        if not UserManager.EMAIL_REGEX.match(email):
            raise ValueError("Invalid email format")

    @staticmethod
    def validate_username(username):
        if not username or len(username) < 3:
            raise ValueError("Username must be at least 3 characters long")

    @staticmethod
    def validate_expiry_time(expiry_time):
        try:
            datetime.fromisoformat(expiry_time)
        except ValueError:
            raise ValueError("Invalid expiry_time format. Must be ISO 8601.")

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
        self.validate_username(username)
        self.validate_email(email)
        self.validate_expiry_time(expiry_time)

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

            # Stampare la password generata durante i test
            logging.info(f"Generated password for user {username}: {password}")

            return {"message": "User created", "openstack_id": user.id }, 201
        except Exception as e:
            return {"error": str(e)}, 500

    def update_user(self, user_id, **fields):
        """
        Aggiorna dinamicamente uno o più campi di un utente (email, progetto, ruolo, expiry_time).
        """
        if "username" in fields:
            return {"error": "Username cannot be updated"}, 400
        
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

            update_operations = {
                "email": lambda value: self._update_email(conn, user["openstack_user_id"], value),
                "project": lambda value: self._update_project(conn, user["openstack_user_id"], value),
                "role": lambda value: self._update_role(conn, user["openstack_user_id"], value, user["project_id"]),
                "expiry_time": lambda value: self._update_expiry_time(conn, user["openstack_user_id"], value)
            }

            updated_fields = []
            for field, value in fields.items():
                try:
                    if field == "email":
                        self.validate_email(value)
                    if field == "expiry_time":
                        self.validate_expiry_time(value)
                    update_operations[field](value)
                    updated_fields.append(field)
                except Exception as e:
                    return {"error": f"Failed to update {field}: {str(e)}"}, 400

            if updated_fields:
                conn.commit()
                return {"message": f"User updated successfully. Fields updated: {', '.join(updated_fields)}"}, 200

            return {"error": "No valid fields provided for update"}, 400

    def _update_email(self, conn, user_id, email):
        conn.execute(
            "UPDATE temporary_users SET email = ? WHERE openstack_user_id = ?",
            (email, user_id)
        )

        user = self.keystone.users.get(user_id)
        self.keystone.users.update(user, email=email)

    def _update_project(self, conn, user_id, project_name):
        try:
            project = self.keystone.projects.find(name=project_name)
        except Exception:
            raise ValueError(f"Project '{project_name}' not found")

        conn.execute(
            "UPDATE temporary_users SET project_id = ?, project_name = ? WHERE openstack_user_id = ?",
            (project.id, project_name, user_id)
        )

        user = self.keystone.users.get(user_id)
        current_project_id = conn.execute(
            "SELECT project_id FROM temporary_users WHERE openstack_user_id = ?",
            (user_id,)
        ).fetchone()[0]

        if current_project_id:
            current_project = self.keystone.projects.get(current_project_id)
            current_roles = self.keystone.roles.list(user=user, project=current_project)

            for role in current_roles:
                self.keystone.roles.revoke(role=role, user=user, project=current_project)

        role_obj = self.keystone.roles.find(name=conn.execute(
            "SELECT role FROM temporary_users WHERE openstack_user_id = ?",
            (user_id,)
        ).fetchone()[0])

        self.keystone.roles.grant(role=role_obj, user=user, project=project)

    def _update_role(self, conn, user_id, role_name, project_id):
        try:
            role = self.keystone.roles.find(name=role_name)
        except Exception:
            raise ValueError(f"Role '{role_name}' not found")

        conn.execute(
            "UPDATE temporary_users SET role = ? WHERE openstack_user_id = ?",
            (role_name, user_id)
        )

        user = self.keystone.users.get(user_id)
        project = self.keystone.projects.get(project_id)

        for current_role in self.keystone.roles.list(user=user, project=project):
            self.keystone.roles.revoke(role=current_role, user=user, project=project)
        self.keystone.roles.grant(role=role, user=user, project=project)

    def _update_expiry_time(self, conn, user_id, expiry_time):
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
