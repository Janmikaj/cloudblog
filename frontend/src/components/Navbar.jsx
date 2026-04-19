import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Forces re-render on route change
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">CloudBlog</Link>
      </div>
      
      <div className="navbar-links">
        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Search articles..." 
            onChange={(e) => {
              if (e.target.value) {
                navigate(`/?search=${encodeURIComponent(e.target.value)}`);
              } else {
                navigate('/');
              }
            }}
            defaultValue={new URLSearchParams(location.search).get('search') || ''}
            className="navbar-search-input"
          />
        </div>
        {user ? (
          <>
            {(user.role === 'admin' || user.role === 'editor') && <Link to="/editor">Write</Link>}
            {(user.role === 'admin' || user.role === 'editor') && (
              <Link to="/dashboard">{user.role === 'admin' ? 'Admin' : 'Dashboard'}</Link>
            )}
            <button className="btn-link" onClick={handleLogout}>Logout ({user.username})</button>
          </>
        ) : (
          <Link to="/login" className="btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
