from datetime import datetime
from db import get_db_connection
from user_manager import delete_user

def cleanup_expired_users():
    now = datetime.utcnow()  # Usa UTC per evitare problemi di fuso orario
    print(f"Running cleanup at {now}")

    with get_db_connection() as conn:
        expired_users = conn.execute(
            "SELECT openstack_user_id, username, expiry_time FROM temporary_users WHERE expiry_time <= ?",
            (now,)  # Confronta con l'orario corrente in UTC
        ).fetchall()
        
        if not expired_users:
            print("No expired users found.")
            return
        
        for user in expired_users:
            try:
                delete_user(user['openstack_user_id'])
                print(f"Deleted user {user['username']} (ID: {user['openstack_user_id']})")
                
                # Rimuovi dal database
                conn.execute(
                    "DELETE FROM temporary_users WHERE openstack_user_id = ?",
                    (user['openstack_user_id'],)
                )
                conn.commit()
            except Exception as e:
                print(f"Error deleting user {user['username']} (ID: {user['openstack_user_id']}): {e}")
