import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Intentional Vulnerability: No input sanitization before sending
      const response = await api.post('/register', { username, email, password, role });
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card bg-dark text-white p-4 border-secondary shadow-lg" style={{ width: '100%', maxWidth: '400px', borderRadius: '1.5rem' }}>
        <div className="card-body">
          <h2 className="card-title text-center fw-bold mb-2">Register</h2>
          <p className="text-muted text-center mb-4">Create a new account</p>
          
          {error && <div className="alert alert-danger py-2">{error}</div>}
          
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label text-light small fw-bold">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="form-control bg-transparent text-white border-secondary"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-light small fw-bold">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="form-control bg-transparent text-white border-secondary"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-light small fw-bold">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="form-control bg-transparent text-white border-secondary"
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-light small fw-bold">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-select bg-transparent text-white border-secondary"
              >
                <option value="user" className="bg-dark">User</option>
                <option value="editor" className="bg-dark">Editor</option>
                <option value="admin" className="bg-dark">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold">Register</button>
          </form>
          <p className="mt-4 text-center small text-muted">
            Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-bold">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
