from datetime import datetime, timezone
from db import get_db_connection
from user_manager import delete_user

def cleanup_expired_users():
    now = datetime.now(timezone.utc)  # Usa UTC per coerenza
    print(f"Running cleanup at {now.isoformat()}")

    with get_db_connection() as conn:
        # Seleziona solo gli utenti con expiry_time scaduto
        expired_users = conn.execute(
            """
            SELECT openstack_user_id, username, expiry_time 
            FROM temporary_users 
            WHERE expiry_time <= ?
            """,
            (now.isoformat(),)  # Confronta con l'orario corrente
        ).fetchall()

        if not expired_users:
            print("No expired users found.")
            return

        for user in expired_users:
            try:
                # Prova a rimuovere l'utente da OpenStack
                delete_user(user['openstack_user_id'])
                print(f"Deleted user from OpenStack: {user['username']} (ID: {user['openstack_user_id']})")
                
                # Rimuovi l'utente dal database solo se la rimozione in OpenStack ha avuto successo
                conn.execute(
                    "DELETE FROM temporary_users WHERE openstack_user_id = ?",
                    (user['openstack_user_id'],)
                )
                conn.commit()  # Salva le modifiche
                print(f"Deleted user from database: {user['username']} (ID: {user['openstack_user_id']})")
            except Exception as e:
                # Gestione dell'errore per utenti non eliminati
                print(f"Error deleting user {user['username']} (ID: {user['openstack_user_id']}): {e}")
