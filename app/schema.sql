-- schema.sql: Definizione tabella utenti temporanei
CREATE TABLE IF NOT EXISTS temporary_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    expiry_time TEXT NOT NULL, -- Salva le date in formato ISO-8601
    email TEXT,
    openstack_user_id TEXT UNIQUE NOT NULL
);
