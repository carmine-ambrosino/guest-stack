import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "mysecret")
    OPENSTACK_CLOUD_NAME = os.environ.get("OPENSTACK_CLOUD_NAME", "devstack-admin")
    OPENSTACK_CONFIG_FILE = os.environ.get("OPENSTACK_CONFIG_FILE", "./clouds.yaml")
    SQLALCHEMY_DATABASE_URI = "sqlite:///temp_users.sqlite3"
    SQLALCHEMY_TRACK_MODIFICATIONS = False