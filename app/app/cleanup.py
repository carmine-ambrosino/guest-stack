from datetime import datetime, timezone
from app.user_manager import UserManager
from app.db.db import get_db_connection
from config import Config
import logging

user_manager = UserManager(**Config.OPENSTACK)

def cleanup_expired_users():
    now = datetime.now(timezone.utc)
    logging.info(f"Running cleanup at {now.isoformat()}")

    with get_db_connection() as conn:
        
        expired_users = conn.execute(
            """
            SELECT id, username 
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
                
                user_manager.delete_user(user["id"])
                logging.info(f"Deleted user: {user['username']} (ID: {user['id']})")

                conn.execute(
                    "DELETE FROM temporary_users WHERE id = ?",
                    (user["id"],)
                )
                conn.commit()
            except Exception as e:
                logging.info(f"Error deleting user {user['username']}): {e}")


if __name__ == "__main__":
    cleanup_expired_users()
