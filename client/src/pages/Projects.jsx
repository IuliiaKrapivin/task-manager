// Renders all project for a user and handles project creation
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TaskList from '../components/TaskList';
import Header from '../components/Header';


export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const API_BASE = 'http://127.0.0.1:5000';


  // Fetch all projects on load
  useEffect(() => {
    fetch(`${API_BASE}/api/projects`, {credentials: 'include'})
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Unexpected response:', data);
          setProjects([]);
        }
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setProjects([]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }) 
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Project added');
      setProjects([...projects, data.project]);
      setName('');
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className='container'>
      <Header />
      <h2>Projects</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
        />
        <button type="submit" disabled={!name.trim()}>Add Project</button>
      </form>
      <p>{message}</p>
      <ul>
        {(projects || []).map((p) => (
            <div key={p.id} className='project-card'>
                <Link to={`/projects/${p.id}`}>{p.name}</Link>
            </div>
        ))}
      </ul>
    </div>
  );
}