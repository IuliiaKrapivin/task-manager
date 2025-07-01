// Renders all project for a user and handles project creation
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TaskList from './TaskList';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all projects on load
  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, user_id: 1 }) // TODO: Replace 1 with logged-in user later
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Project added');
      setProjects([...projects, { name, user_id: 1 }]);
      setName('');
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className='container'>
      <h2>Projects</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
        />
        <button type="submit">Add Project</button>
      </form>
      <p>{message}</p>
      <ul>
        {projects.map((p) => (
            <div key={p.id} className='project-card'>
                <Link to={`/projects/${p.id}`}>{p.name}</Link>
            </div>
        ))}
      </ul>
    </div>
  );
}