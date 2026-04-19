import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CommentSection from '../components/CommentSection';
import DOMPurify from 'dompurify';

const BlogView = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await api.get('/blogs');
      const foundBlog = response.data.find(b => b._id === id);
      if (foundBlog) {
        setBlog(foundBlog);
      } else {
        navigate('/not-found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      navigate('/not-found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (!blog) return null;

  return (
    <div className="blog-view-container">
      <div className="blog-view-header">
        <h1>{blog.title}</h1>
        <p className="blog-meta">By {blog.author} on {new Date(blog.createdAt).toLocaleDateString()}</p>
      </div>
      
      {/* Fixed vulnerability: Rendering sanitized HTML */}
      <div 
        className="blog-view-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }} 
      />
      
      <hr className="divider" />
      
      <CommentSection blogId={blog._id} />
    </div>
  );
};

export default BlogView;
