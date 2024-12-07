import sqlite3
from contextlib import contextmanager

DB_PATH = 'users.db'

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30)  # Timeout per evitare deadlock
    conn.row_factory = sqlite3.Row
    try:
        # Modalità WAL per migliorare la concorrenza
        conn.execute("PRAGMA journal_mode=WAL")
        yield conn
    finally:
        conn.close()

# Funzione per inizializzare il database
def initialize_database():
    try:
        with get_db_connection() as conn:
            with open('schema.sql', 'r') as f:
                schema = f.read()
                conn.executescript(schema)
                print("Database initialized successfully.")
    except sqlite3.OperationalError as e:
        print(f"Database initialization error: {e}")
    except FileNotFoundError:
        print("Schema file 'schema.sql' not found.")
