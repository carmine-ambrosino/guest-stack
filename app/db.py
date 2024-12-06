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

# Inizializza il database
def initialize_database():
    with get_db_connection() as conn:
        with open('schema.sql') as f:
            conn.executescript(f.read())
