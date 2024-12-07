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
# Configurazioni OpenStack
DEFAULT_PROJECT_NAME = 'demo'  # Nome del progetto di default
DEFAULT_ROLE_NAME = 'member'  # Nome del ruolo di default

keystone = get_keystone_client(AUTH_URL, USERNAME, PASSWORD, USER_DOMAIN_NAME, PROJECT_NAME, PROJECT_DOMAIN_NAME)


def create_user(username, expiry_time, email):
    expiry_time_utc = datetime.fromisoformat(expiry_time).astimezone(timezone.utc)

    # Crea l'utente in OpenStack
    user = keystone.users.create(
        name=username,
        password='temporary_password',
        email=email,
        description=f'Temporary user expiring on {expiry_time_utc.isoformat()}',
        enabled=True
    )

    # Recupera o crea il progetto di default
    project = keystone.projects.find(name=DEFAULT_PROJECT_NAME)
    role = keystone.roles.find(name=DEFAULT_ROLE_NAME)
    keystone.roles.grant(role=role, user=user, project=project)

    # Memorizza utente e progetto nel database
    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO temporary_users 
            (username, expiry_time, email, openstack_user_id, project_id) 
            VALUES (?, ?, ?, ?, ?)
            """,
            (username, expiry_time_utc.isoformat(), email, user.id, project.id)
        )
        conn.commit()

    return user


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


def update_user(user_id, new_expiry_time=None, email=None, project_name=None):
    with get_db_connection() as conn:
        # Recupera l'utente dal database
        user = conn.execute(
            "SELECT * FROM temporary_users WHERE openstack_user_id = ?",
            (user_id,)
        ).fetchone()
        if not user:
            raise ValueError("User not found")

        # Aggiorna l'utente in OpenStack
        update_fields = {}
        if new_expiry_time:
            expiry_time_utc = datetime.fromisoformat(new_expiry_time).astimezone(timezone.utc)
            update_fields['description'] = f"Updated expiry time to {expiry_time_utc.isoformat()}"
            conn.execute(
                "UPDATE temporary_users SET expiry_time = ? WHERE openstack_user_id = ?",
                (expiry_time_utc.isoformat(), user_id)
            )
        if email:
            update_fields['email'] = email
            conn.execute(
                "UPDATE temporary_users SET email = ? WHERE openstack_user_id = ?",
                (email, user_id)
            )

        if project_name:
            # Trova o crea un nuovo progetto in OpenStack
            project = keystone.projects.find(name=project_name)
            if not project:
                project = keystone.projects.create(
                    name=project_name,
                    domain="default",
                    description="User-specific project"
                )
            conn.execute(
                "UPDATE temporary_users SET project_id = ? WHERE openstack_user_id = ?",
                (project.id, user_id)
            )

        if update_fields:
            keystone.users.update(user_id, **update_fields)
        
        conn.commit()
        

def delete_user(user_id):
    try:
        # Elimina utente da OpenStack
        keystone.users.delete(user_id)
        print(f"Successfully deleted user from OpenStack: {user_id}")
    except Exception as e:
        print(f"Failed to delete user from OpenStack: {user_id}. Error: {e}")
        raise  # Propaga l'eccezione per la gestione nel chiamante


#def delete_user(user_id):
#    try:
#        # Elimina utente da OpenStack
#        keystone.users.delete(user_id)
#       
#        # Elimina dal database locale
#        with get_db_connection() as conn:
#            with conn:  # Gestione atomica tramite contesto di transazione
#                conn.execute(
#                    "DELETE FROM temporary_users WHERE openstack_user_id = ?",
#                    (user_id,)
#                )
#    except Exception as e:
#        print(f"Error deleting user {user_id}: {e}")
#        raise
