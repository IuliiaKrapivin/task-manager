// Renders all tasks recived from TaskList for a specific project 
import { useParams, Link } from 'react-router-dom';
import TaskList from './TaskList';

function TaskPage() {
  const { id } = useParams();  // get project ID from URL

  return (
    <div className='container'>
      <h2>Tasks for Project {id}</h2>
      <TaskList projectId={id} />
      <Link to="/"> Back to projects </Link>
    </div>
  );
}

export default TaskPage;