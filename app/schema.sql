CREATE TABLE IF NOT EXISTS temporary_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    expiry_time TEXT NOT NULL,
    email TEXT NOT NULL,
    openstack_user_id TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL
);
