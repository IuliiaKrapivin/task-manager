import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const API_BASE = 'http://127.0.0.1:5000';

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        localStorage.removeItem('username');
        navigate('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

    return (
    <header>
      <h2>Task Manager</h2>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
}