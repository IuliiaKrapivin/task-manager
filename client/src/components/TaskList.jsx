//Renders all tasks for a project and handles task creation, editing and deletion
import { useEffect, useState } from 'react';

export default function TaskList({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'to-do',
    due_date: '',
    priority: 'medium'
  });
  const [message, setMessage] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    due_date: '',
    priority: ''
  });
  const API_BASE = 'http://127.0.0.1:5000';



  useEffect(() => { 
    fetch(`${API_BASE}/api/projects/${projectId}/tasks`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setTasks(data));
  }, [projectId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Task added');
      setTasks([...tasks, data.task]);
      setForm({
        title: '',
        description: '',
        status: 'to-do',
        due_date: '',
        priority: 'medium'
      });
    } else {
      setMessage(data.error);
    }
  };
 
  const handleDelete = async (taskId) => { 
    const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      setTasks(tasks.filter(t => t.id !== taskId));
      setMessage('Task deleted');
    } else {
      setMessage('Failed to delete task');
    }
  };

  const openEditForm = (task) => {
    setEditingTask(task.id);
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date,
      priority: task.priority
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/api/tasks/${editingTask}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });

    if (res.ok) {
      const updatedTasks = (tasks || []).map(t =>
        t.id === editingTask ? { ...t, ...editData } : t
      );
      setTasks(updatedTasks);
      setEditingTask(null); // close the popup
    } else {
      alert('Failed to update task');
    }
  };

  return (
    <div>
      <h4>Tasks</h4>

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} /><br />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} /><br />
        <input name="due_date" type="date" value={form.due_date} onChange={handleChange} /><br />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="to-do">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select><br />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select><br />
        <button type="submit">Add Task</button>
      </form>
      <p>{message}</p>

      {editingTask && (
        <div className='popup-overlay'>
          <div className="popup-form">
            <h3>Edit Task</h3>
            <form onSubmit={handleEditSubmit}>
              <input name="title" value={editData.title} onChange={handleEditChange} />
              <textarea name="description" value={editData.description} onChange={handleEditChange} />
              <select name="status" value={editData.status} onChange={handleEditChange}>
                <option value="to-do">To Do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>  
              <input name="due_date" value={editData.due_date} onChange={handleEditChange} />
              <select name="priority" value={editData.priority} onChange={handleEditChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingTask(null)}>Cancel</button>
            </form>    
          </div>
        </div>  
      )}
  
      <ul>
        {(tasks || []).map((t, idx) => (
          <li key={idx} className='task-card'>
            <strong>{t.title}</strong> — {t.status} — {t.priority} — {t.due_date}
            <br />
            <em>{t.description}</em>
            <br />
            <button onClick={() => openEditForm(t)}>Edit</button>
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}