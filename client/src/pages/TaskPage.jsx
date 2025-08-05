// Renders all tasks recived from TaskList for a specific project 
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TaskList from '../components/TaskList';

function TaskPage() {
  const { id } = useParams();  // get project ID from URL
  const [projectName, setProjectName] = useState('');
  const API_BASE = 'http://127.0.0.1:5000';
  
  useEffect(() => {
    fetch(`${API_BASE}/api/projects`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // Find the project with the matching id
        const project = (data || []).find(p => String(p.id) === String(id));
        setProjectName(project ? project.name : 'Unknown Project');
      });
  }, [id]);

  return (
    <div className='container'>
      <h2>Tasks for {projectName}</h2>
      <TaskList projectId={id} />
      <Link to="/projects"> Back to projects </Link>
    </div>
  );
}

export default TaskPage;