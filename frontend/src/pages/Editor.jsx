import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const Editor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin' && user.role !== 'editor') {
      navigate('/');
    }
    
    if (id) {
      fetchBlog();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, user?.username, user?.role]);

  const fetchBlog = async () => {
    try {
      const response = await api.get('/blogs');
      const blog = response.data.find(b => b._id === id);
      if (blog) {
        // Enforce ownership: Admin can edit any, Editor can only edit their own
        if (user.role !== 'admin' && blog.author !== user.username) {
          navigate('/dashboard');
          return;
        }
        setTitle(blog.title);
        setContent(blog.content);
        setImageUrl(blog.imageUrl || '');
      }
    } catch (err) {
      setError('Failed to fetch blog');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    try {
      if (id) {
        await api.put(`/blogs/${id}`, { title, content, imageUrl });
      } else {
        await api.post('/blogs', { title, content, imageUrl, author: user.username });
      }
      navigate(id ? `/blog/${id}` : '/');
    } catch (err) {
      setError('Failed to save blog');
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-box">
        <h2>{id ? 'Edit Blog' : 'Create New Blog'}</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Enter blog title"
            />
          </div>
          <div className="form-group">
            <label>Cover Image URL (Optional)</label>
            <input 
              type="text" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>
          <div className="form-group">
            <label>Content (HTML supported!)</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              className="form-input editor-textarea"
              placeholder="Write your content here..."
            ></textarea>
          </div>
          <button type="submit" className="btn-primary full-width">
            {id ? 'Update Post' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Editor;
