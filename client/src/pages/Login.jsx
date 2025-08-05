import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const API_BASE = 'http://127.0.0.1:5000';

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      credentials: 'include'});

      const data = await res.json();
      if (res.ok) {
        setMessage('Login successful!');
        localStorage.setItem('username', data.username);
        navigate('/projects');
      } else {
        setMessage(data.error || 'Login failed');
      }
  
    } catch (error) {
        setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} /><br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} /><br />
        <button type="submit">Login</button>
      </form>
      <p>
          Don't have an account? <Link to="/register">Register here</Link>
      </p>
      {message && <p>{message}</p>}
    </div>
  );
}