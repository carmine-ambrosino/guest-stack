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

from datetime import datetime

def create_user(username, expiry_time, email):
    # Assicurati che expiry_time sia in UTC
    expiry_time = datetime.strptime(expiry_time, '%Y-%m-%dT%H:%M:%S')
    expiry_time_utc = expiry_time.astimezone(timezone.utc)

    user = keystone.users.create(
        name=username,
        password='temporary_password',
        email=email,
        description=f'Temporary user expiring on {expiry_time_utc}',
        enabled=True
    )
    with get_db_connection() as conn:
        conn.execute(
            "INSERT INTO temporary_users (username, expiry_time, email, openstack_user_id) VALUES (?, ?, ?, ?)",
            (username, expiry_time_utc, email, user.id)
        )
    return user


def update_user(user_id, new_expiry_time=None, email=None):
    # Recupera utente dal database
    with get_db_connection() as conn:
        user = conn.execute(
            "SELECT * FROM temporary_users WHERE openstack_user_id = ?",
            (user_id,)
        ).fetchone()
        if not user:
            raise ValueError("User not found")

    # Aggiorna utente in OpenStack
    keystone.users.update(
        user_id,
        description=f'Updated expiry time to {new_expiry_time}' if new_expiry_time else user['description'],
        email=email if email else user['email']
    )

    # Aggiorna dati nel database
    with get_db_connection() as conn:
        conn.execute(
            """
            UPDATE temporary_users 
            SET expiry_time = COALESCE(?, expiry_time),
                email = COALESCE(?, email)
            WHERE openstack_user_id = ?
            """,
            (new_expiry_time, email, user_id)
        )
        conn.commit()

def get_active_users():
    now = datetime.utcnow()
    with get_db_connection() as conn:
        return conn.execute(
            "SELECT * FROM temporary_users WHERE expiry_time > ?",
            (now,)
        ).fetchall()
        

def delete_user(user_id):
    try:
        # Elimina utente da OpenStack
        keystone.users.delete(user_id)
        
        # Elimina dal database locale
        with get_db_connection() as conn:
            with conn:  # Gestione atomica tramite contesto di transazione
                conn.execute(
                    "DELETE FROM temporary_users WHERE openstack_user_id = ?",
                    (user_id,)
                )
    except Exception as e:
        print(f"Error deleting user {user_id}: {e}")
        raise
