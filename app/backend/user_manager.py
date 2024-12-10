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
        # Validazioni centralizzate
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
            # Creazione utente e assegnazione ruoli
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

            # Salvataggio nel database
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

            # Log della password
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
        """
        Aggiorna l'email dell'utente.
        """
        # Aggiorna l'email nel database locale
        conn.execute(
            "UPDATE temporary_users SET email = ? WHERE openstack_user_id = ?",
            (email, user_id)
        )

        # Aggiorna l'email nell'utente OpenStack
        user = self.keystone.users.get(user_id)
        self.keystone.users.update(user, email=email)

    def _update_role(self, conn, user_id, role_name, project_id):
        """
        Aggiorna il ruolo dell'utente nel progetto specificato.
        """
        # Trova il ruolo nel sistema OpenStack
        role = self.keystone.roles.find(name=role_name)

        # Ottieni l'utente e il progetto
        user = self.keystone.users.get(user_id)
        project = self.keystone.projects.get(project_id)

        # Revoca tutti i ruoli attuali sull'utente nel progetto
        current_roles = self.keystone.roles.list(user=user, project=project)
        for current_role in current_roles:
            self.keystone.roles.revoke(role=current_role, user=user, project=project)

        # Assegna il nuovo ruolo all'utente nel progetto
        self.keystone.roles.grant(role=role, user=user, project=project)

        # Aggiorna il ruolo nel database
        conn.execute(
            "UPDATE temporary_users SET role = ? WHERE openstack_user_id = ?",
            (role_name, user_id)
        )


    def _update_project_and_role(self, conn, user_id, project_name, role_name=None):
        """
        Aggiorna il progetto predefinito e il ruolo dell'utente.
        Revoca l'accesso a tutti gli altri progetti.
        """
        try:
            # Trova il progetto target
            project = self.keystone.projects.find(name=project_name)
        except Exception:
            raise ValueError(f"Project '{project_name}' not found")

        # Aggiorna il database con il nuovo progetto
        conn.execute(
            "UPDATE temporary_users SET project_id = ?, project_name = ? WHERE openstack_user_id = ?",
            (project.id, project_name, user_id)
        )

        # Ottieni l'utente OpenStack
        user = self.keystone.users.get(user_id)

        # Imposta il progetto come predefinito
        self.keystone.users.update(user=user, default_project=project)

        # Revoca l'accesso a tutti gli altri progetti
        all_projects = self.keystone.projects.list(user=user)
        for other_project in all_projects:
            if other_project.id != project.id:  # Salta il progetto target
                current_roles = self.keystone.roles.list(user=user, project=other_project)
                for role in current_roles:
                    self.keystone.roles.revoke(role=role, user=user, project=other_project)

        # Assegna il ruolo al nuovo progetto
        if not role_name:
            # Recupera il ruolo dal database se non specificato
            role_name = conn.execute(
                "SELECT role FROM temporary_users WHERE openstack_user_id = ?",
                (user_id,)
            ).fetchone()[0]

        self._update_role(conn, user_id, role_name, project.id)


    def _update_expiry_time(self, conn, user_id, expiry_time):
        """
        Aggiorna il tempo di scadenza dell'utente.
        """
        # Verifica che il tempo di scadenza sia valido
        self.validate_expiry_time(expiry_time)

        # Aggiorna il tempo di scadenza nel database
        conn.execute(
            "UPDATE temporary_users SET expiry_time = ? WHERE openstack_user_id = ?",
            (expiry_time, user_id)
        )

    def update_user(self, user_id, email=None, project=None, role=None, expiry_time=None):
        """
        Aggiorna i campi di un utente (email, progetto, ruolo, expiry_time) in una singola operazione.
        """
        is_valid, user_id = self.is_valid_user_id(user_id)
        if not is_valid:
            return {"error": "Invalid user ID"}, 400

        with get_db_connection() as conn:
            # Recupera l'utente dal database
            user = conn.execute(
                "SELECT * FROM temporary_users WHERE id = ?",
                (user_id,)
            ).fetchone()

            if not user:
                return {"error": "User not found in the database"}, 404

            try:
                # Aggiorna email
                if email:
                    self._update_email(conn, user["openstack_user_id"], email)

                # Aggiorna progetto e ruolo
                if project:
                    self._update_project_and_role(conn, user["openstack_user_id"], project, role)

                # Aggiorna expiry_time
                if expiry_time:
                    self._update_expiry_time(conn, user["openstack_user_id"], expiry_time)

                conn.commit()
                return {"message": "User updated successfully"}, 200

            except Exception as e:
                conn.rollback()
                return {"error": f"Failed to update user: {str(e)}"}, 400
