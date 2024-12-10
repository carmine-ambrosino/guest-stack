from flask import Flask
from config import Config
from backend.routes.api import api_bp
from backend.routes.openstack import openstack_bp
from backend.routes.users import users_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Registra i Blueprint
    app.register_blueprint(api_bp)
    app.register_blueprint(openstack_bp)
    app.register_blueprint(users_bp)

    return app
