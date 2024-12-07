# user_manager.py
from datetime import datetime, timezone
from openstack_client import get_keystone_client
from db import get_db_connection

# Configurazioni OpenStack
AUTH_URL = 'http://192.168.122.134/identity'
USERNAME = 'admin'
PASSWORD = 'nomoresecret'
USER_DOMAIN_NAME = 'default'
PROJECT_NAME = 'admin'
PROJECT_DOMAIN_NAME = 'default'

keystone = get_keystone_client(AUTH_URL, USERNAME, PASSWORD, USER_DOMAIN_NAME, PROJECT_NAME, PROJECT_DOMAIN_NAME)


def create_user(username, expiry_time, email, project_name, role_name):
    expiry_time_utc = datetime.fromisoformat(expiry_time).astimezone(timezone.utc)

    # Verifica che il progetto esista
    try:
        project = keystone.projects.find(name=project_name)
    except Exception:
        return {"error": f"Project '{project_name}' not found"}, 400

    # Verifica che il ruolo esista
    try:
        role = keystone.roles.find(name=role_name)
    except Exception:
        return {"error": f"Role '{role_name}' not found"}, 400

    # Crea l'utente in OpenStack
    try:
        user = keystone.users.create(
            name=username,
            password='temporary_password',
            email=email,
            description=f'Temporary user expiring on {expiry_time_utc.isoformat()}',
            enabled=True
        )
    except Exception as e:
        return {"error": f"Error creating user in OpenStack: {str(e)}"}, 500

    # Assegna il progetto e il ruolo all'utente
    try:
        keystone.roles.grant(role=role, user=user, project=project)
    except Exception as e:
        # Se il ruolo o il progetto non possono essere assegnati, restituiamo un errore
        return {"error": f"Error assigning project or role: {str(e)}"}, 500

    # Memorizza l'utente nel database
    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO temporary_users 
            (username, expiry_time, email, openstack_user_id, project_id, role) 
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (username, expiry_time_utc.isoformat(), email, user.id, project.id, role_name)
        )
        conn.commit()

    return {
        "message": "User created",
        "user": {
            "username": username,
            "email": email,
            "expiry_time": expiry_time,
            "project": project_name,
            "role": role_name,
            "openstack_user_id": user.id
        }
    }, 201


def get_active_users():
    now = datetime.now(timezone.utc)
    with get_db_connection() as conn:
        return conn.execute(
            """
            SELECT * FROM temporary_users 
            WHERE expiry_time > ?
            """,
            (now.isoformat(),)
        ).fetchall()


def update_user(user_id, new_expiry_time=None, email=None, project_name=None, role_name=None):
    with get_db_connection() as conn:
        # Recupera l'utente dal database
        user = conn.execute(
            "SELECT * FROM temporary_users WHERE openstack_user_id = ?",
            (user_id,)
        ).fetchone()
        if not user:
            return {"error": "User not found in the database"}, 404

        update_fields = {}

        # Aggiorna expiry_time
        if new_expiry_time:
            expiry_time_utc = datetime.fromisoformat(new_expiry_time).astimezone(timezone.utc)
            update_fields['description'] = f"Updated expiry time to {expiry_time_utc.isoformat()}"
            conn.execute(
                "UPDATE temporary_users SET expiry_time = ? WHERE openstack_user_id = ?",
                (expiry_time_utc.isoformat(), user_id)
            )

        # Aggiorna email
        if email:
            update_fields['email'] = email
            conn.execute(
                "UPDATE temporary_users SET email = ? WHERE openstack_user_id = ?",
                (email, user_id)
            )

        # Aggiorna progetto
        if project_name:
            try:
                project = keystone.projects.find(name=project_name)
            except Exception:
                return {"error": f"Project '{project_name}' not found"}, 400
            conn.execute(
                "UPDATE temporary_users SET project_id = ? WHERE openstack_user_id = ?",
                (project.id, user_id)
            )

        # Aggiorna ruolo
        if role_name:
            try:
                role = keystone.roles.find(name=role_name)
            except Exception:
                return {"error": f"Role '{role_name}' not found"}, 400
            # Assegna il ruolo all'utente
            keystone.roles.grant(role=role, user=user_id, project=user['project_id'])
            conn.execute(
                "UPDATE temporary_users SET role = ? WHERE openstack_user_id = ?",
                (role_name, user_id)
            )

        # Aggiorna utente in OpenStack
        if update_fields:
            keystone.users.update(user_id, **update_fields)

        conn.commit()
        return {"message": "User updated"}, 200
        

def delete_user(user_id):
    try:
        # Elimina utente da OpenStack
        keystone.users.delete(user_id)
        print(f"Successfully deleted user from OpenStack: {user_id}")
    except Exception as e:
        print(f"Failed to delete user from OpenStack: {user_id}. Error: {e}")
        raise  # Propaga l'eccezione per la gestione nel chiamante