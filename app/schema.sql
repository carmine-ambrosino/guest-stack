-- schema.sql: Definizione tabella utenti temporanei
CREATE TABLE IF NOT EXISTS temporary_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    expiry_time DATETIME NOT NULL,
    email TEXT,
    openstack_user_id TEXT UNIQUE NOT NULL
);
