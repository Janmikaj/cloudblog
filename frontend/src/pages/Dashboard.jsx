import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      navigate('/');
    } else {
      fetchBlogs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, user?.username, user?.role]);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/blogs');
      // Admin sees all, Editor sees only their own
      const fetchedBlogs = response.data;
      if (user.role === 'admin') {
        setBlogs(fetchedBlogs);
      } else {
        setBlogs(fetchedBlogs.filter(b => b.author === user.username));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`/blogs/${id}`);
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  return (
    <div className="admin-container">
      <h2>{user?.role === 'admin' ? 'Admin Dashboard' : 'My Blogs'}</h2>
      <div className="admin-actions">
        <Link to="/editor" className="btn-primary">Create New Post</Link>
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map(blog => (
              <tr key={blog._id}>
                <td>{blog.title}</td>
                <td>{blog.author}</td>
                <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/editor/${blog._id}`} className="btn-secondary btn-sm">Edit</Link>
                  <button onClick={() => handleDelete(blog._id)} className="btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
