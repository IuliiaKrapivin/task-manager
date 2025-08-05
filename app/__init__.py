from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from config import Config
from flask_cors import CORS

db = SQLAlchemy()
login_manager = LoginManager()

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized'}), 401


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False  # change to True in production over HTTPS
    )

    CORS(app, origins=["http://127.0.0.1:3000"], supports_credentials=True)


    db.init_app(app)
    login_manager.init_app(app)

    from .routes import main
    app.register_blueprint(main)

    from app import models

    return app