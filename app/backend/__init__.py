from flask import Flask
from config import Config
from backend.routes.users import users_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Registra i Blueprint
    app.register_blueprint(users_bp)

    return app
