import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-secondary">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">CloudBlog</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <form className="d-flex me-auto my-2 my-lg-0 w-100 mx-lg-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              className="form-control me-2 rounded-pill bg-secondary text-white border-0" 
              type="search" 
              placeholder="Search articles..." 
              onChange={(e) => {
                if (e.target.value) {
                  navigate(`/?search=${encodeURIComponent(e.target.value)}`);
                } else {
                  navigate('/');
                }
              }}
              defaultValue={new URLSearchParams(location.search).get('search') || ''}
            />
          </form>
          <ul className="navbar-nav align-items-center">
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'editor') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/editor">Write</Link>
                  </li>
                )}
                {(user.role === 'admin' || user.role === 'editor') && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">{user.role === 'admin' ? 'Admin' : 'Dashboard'}</Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn nav-link text-light border-0 bg-transparent" onClick={handleLogout}>
                    Logout ({user.username})
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-primary rounded-pill px-4" to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
