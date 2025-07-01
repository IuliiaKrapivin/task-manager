from flask import request, redirect, url_for, flash, Blueprint, jsonify
from flask_login import login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Project, Task, db
from flask_login import login_required
from datetime import datetime

main = Blueprint('main', __name__)


# Route for new ures registration 
@main.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing fields'}), 400

    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_pw)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Route for a user to log in 
@main.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# Route for a user to log out
@main.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.')
    return redirect(url_for('main.login'))

# Route get and create projects 
@main.route('/api/projects', methods=['GET', 'POST'])
def api_projects():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        user_id = data.get('user_id')  # Later: auto-grab from session

        if not name or not user_id:
            return jsonify({'error': 'Missing data'}), 400

        new_project = Project(name=name, user_id=user_id)
        db.session.add(new_project)
        db.session.commit()

        return jsonify({'message': 'Project created'}), 201

    # GET request
    projects = Project.query.all()
    result = [{'id': p.id, 'name': p.name, 'user_id': p.user_id} for p in projects]
    return jsonify(result) 

# Route to get and create tasks for a specific project
@main.route('/api/projects/<int:project_id>/tasks', methods=['GET', 'POST'])
def project_tasks(project_id):
    if request.method == 'POST':
        data = request.get_json()

        title = data.get('title')
        description = data.get('description')
        status = data.get('status', 'to-do')
        due_date_str = data.get('due_date')        
        priority = data.get('priority')

        if not title:
            return jsonify({'error': 'Missing task title'}), 400
                
        # Convert date string to date object 
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date() if due_date_str else None

        new_task = Task(
            title=title,
            description=description,
            status=status,
            due_date=due_date,  # format: "YYYY-MM-DD"
            priority=priority,
            project_id=project_id
        )
        db.session.add(new_task)
        db.session.commit()

        return jsonify({
            'message': 'Task created',
            'task': {
                'id': new_task.id,
                'title': new_task.title,
                'description': new_task.description,
                'status': new_task.status,
                'due_date': new_task.due_date.isoformat() if new_task.due_date else None,
                'priority': new_task.priority
            }    
        }), 201

    # GET all tasks for the project
    tasks = Task.query.filter_by(project_id=project_id).all()
    result = [
        {
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'status': t.status,
            'due_date': t.due_date.isoformat() if t.due_date else None,
            'priority': t.priority
        }
        for t in tasks
    ]
    return jsonify(result)

# Route to delete a specific task
@main.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200

# Route to update a specific task with new data 
@main.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()

    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)

    # parse and update due_date
    due_date_str = data.get('due_date')
    if due_date_str:
        try:
            task.due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

    db.session.commit()

    return jsonify({'message': 'Task updated', 'task': {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'priority': task.priority
    }})