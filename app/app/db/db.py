import sqlite3
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_URI)
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    """
    Init database: create `temporary_users` if not exist.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS temporary_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                expiry_time TEXT NOT NULL,
                email TEXT NOT NULL,
                openstack_user_id TEXT NOT NULL UNIQUE,
                project_id TEXT NOT NULL,
                project_name TEXT NOT NULL,
                role TEXT NOT NULL
            )
        """)
        conn.commit()
        print("Database initialized successfully.")
