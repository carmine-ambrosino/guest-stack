from datetime import datetime, timezone
from user_manager import UserManager
from db import get_db_connection
from config import Config
import logging

# Inizializza UserManager con la configurazione OpenStack
user_manager = UserManager(**Config.OPENSTACK)

def cleanup_expired_users():
    now = datetime.now(timezone.utc)
    logging.info(f"Running cleanup at {now.isoformat()}")

    with get_db_connection() as conn:
        # Recupera gli utenti scaduti
        expired_users = conn.execute(
            """
            SELECT openstack_user_id, username 
            FROM temporary_users 
            WHERE expiry_time <= ?
            """,
            (now.isoformat(),),
        ).fetchall()

        if not expired_users:
            logging.info("No expired users found.")
            return

        for user in expired_users:
            try:
                # Elimina l'utente da OpenStack
                user_manager.delete_user(user["openstack_user_id"])
                logging.info(f"Deleted user: {user['username']} (ID: {user['openstack_user_id']})")

                # Rimuovi l'utente dal database
                conn.execute(
                    "DELETE FROM temporary_users WHERE openstack_user_id = ?",
                    (user["openstack_user_id"],),
                )
                conn.commit()
                logging.info(f"Deleted user from database: {user['username']} (ID: {user['openstack_user_id']})")
            except Exception as e:
                logging.info(f"Error deleting user {user['username']} (ID: {user['openstack_user_id']}): {e}")


if __name__ == "__main__":
    cleanup_expired_users()
