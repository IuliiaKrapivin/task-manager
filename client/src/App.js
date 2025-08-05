import './styles/App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import Projects from './pages/Projects';
import Register from './pages/Register';
import Login from './pages/Login';
import TaskPage from './pages/TaskPage';
import PrivateRoute from './components/PrivateRoute';


function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />
      
        <Route
          path="/projects/:id"
          element={
           <PrivateRoute>
              <TaskPage />
           </PrivateRoute>
          }
        />
      </Routes>        
  );
}

export default App;
