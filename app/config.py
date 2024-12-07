class Config:
    # Database configuration
    DATABASE_URI = "temporary_users.db"

    # OpenStack configuration
    OPENSTACK = {
        "auth_url": "http://192.168.122.134/identity",
        "username": "admin",
        "password": "nomoresecret",
        "user_domain_name": "default",
        "project_name": "admin",
        "project_domain_name": "default",
    }

    # Application configuration
    DEBUG = False
    FLASK_PORT = 5000
    FLASK_HOST = "0.0.0.0"
    RELOADER = False
    TIME_SCHED = 1