class Config:
    API_PREFIX = "/api/v1"
    
    # Database configuration
    DATABASE_URI = "app/db/temporary_users.db"

    # OpenStack configuration
    OPENSTACK = {
        "auth_url": "http://127.0.0.1/identity",
        "username": "admin",
        "password": "nomoresecret",
        "user_domain_name": "default",
        "project_name": "admin",
        "project_domain_name": "default",
    }

    # Application configuration
    DEBUG = False
    FLASK_PORT = 5234
    FLASK_HOST = "0.0.0.0"
    RELOADER = False
    TIME_SCHED = 1