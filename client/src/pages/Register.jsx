import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const API_BASE = 'http://127.0.0.1:5000';


  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('Registered successfully!');
      navigate('/login');
    } else {
      setMessage(data.error || 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} /><br />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} /><br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} /><br />
        <button type="submit">Register</button>
      </form>
      <p>{message}</p>
      
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}