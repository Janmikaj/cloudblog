import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Intentional Vulnerability: No input sanitization before sending
      const response = await api.post('/login', { identity, password });
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card bg-dark text-white p-4 border-secondary shadow-lg" style={{ width: '100%', maxWidth: '400px', borderRadius: '1.5rem' }}>
        <div className="card-body">
          <h2 className="card-title text-center fw-bold mb-2">Welcome Back</h2>
          <p className="text-muted text-center mb-4">Sign in to your account</p>
          
          {error && <div className="alert alert-danger py-2">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label text-light small fw-bold">Username or Email</label>
              <input 
                type="text" 
                value={identity} 
                onChange={(e) => setIdentity(e.target.value)}
                className="form-control bg-transparent text-white border-secondary"
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-light small fw-bold">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="form-control bg-transparent text-white border-secondary"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold">Login</button>
          </form>
          <p className="mt-4 text-center small text-muted">
            Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-bold">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
