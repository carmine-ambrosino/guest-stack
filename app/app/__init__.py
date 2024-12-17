from flask import Flask
from config import Config
from app.routes.api import api_bp
from app.routes.openstack import openstack_bp
from app.routes.users import users_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register Blueprint
    app.register_blueprint(api_bp)
    app.register_blueprint(openstack_bp)
    app.register_blueprint(users_bp)

    return app
