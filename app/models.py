from flask_login import UserMixin
from app import db, login_manager

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    """Represents user with its credentials """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

    projects = db.relationship('Project', backref='owner', lazy=True)

class Project(db.Model):
    """Project model contains name and related to user"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    tasks = db.relationship('Task', backref='project', lazy=True)

class Task(db.Model):
    """Represents a task in project; contains a title, description, satus, date and priority; related to project"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='To Do')  # To Do, In Progress, Done
    due_date = db.Column(db.Date)
    priority = db.Column(db.String(10))  # Low, Medium, High

    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)