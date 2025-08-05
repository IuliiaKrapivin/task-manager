from flask import request, redirect, url_for, flash, Blueprint, jsonify
from flask_login import login_user, logout_user, login_required, current_user 
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Project, Task, db
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
    
    new_user = User(username=username, email=email)
    new_user.password = password

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Route for a user to log in 
@main.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing e-mail or password'}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        login_user(user)
        return jsonify({'message': 'Login successful', 'username': user.username}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# Route for a user to log out
@main.route('/api/logout', methods=['POST'] )
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'User logged out successfully'}), 200

@main.route('/api/user')
@login_required
def get_user():
    return jsonify({'username': current_user.username, 'email': current_user.email})


# Route get and create projects 
@main.route('/api/projects', methods=['GET', 'POST'])
@login_required
def api_projects():
    if request.method == 'POST':
        data = request.get_json()
        name = data.get('name')

        if not name:
            return jsonify({'error': 'Missing data'}), 400

        new_project = Project(name=name, user_id=current_user.id)
        db.session.add(new_project)
        db.session.commit()

        return jsonify({
            'message': 'Project created',
            'project': {
                'id': new_project.id,
                'name': new_project.name,
                'user_id': new_project.user_id
            }
        }), 201

    # GET request
    projects = Project.query.filter_by(user_id=current_user.id).all()
    result = [{'id': p.id, 'name': p.name, 'user_id': p.user_id} for p in projects]
    return jsonify(result) 

# Route to get and create tasks for a specific project
@main.route('/api/projects/<int:project_id>/tasks', methods=['GET', 'POST'])
@login_required
def project_tasks(project_id):

    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        return jsonify({'error': 'Project not found or access denied'}), 404
        

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
@login_required
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    project = Project.query.get(task.project_id)
    if not project or project.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403    

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200

# Route to update a specific task with new data 
@main.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.get_or_404(task_id)

    project = Project.query.get(task.project_id)
    if not project or project.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403

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

@main.route("/cors-test")
def cors_test():
    return {"message": "CORS is working!"}
