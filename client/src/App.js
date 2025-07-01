import './App.css';
import { Route, Routes } from 'react-router-dom';
import Projects from './Projects';
// import Register from './Register';
// import Login from './Login';
import TaskPage from './TaskPage';


function App() {
  return (
      <Routes>
        <Route path="/" element={<Projects />} />
        <Route path="/projects/:id" element={<TaskPage />} />
      </Routes>        
  );
}

export default App;
