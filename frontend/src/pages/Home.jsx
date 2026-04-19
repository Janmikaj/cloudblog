import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BlogCard from '../components/BlogCard';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-container">
      <section className="blog-grid" style={{ marginTop: '0' }}>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))
        ) : (
          <p className="no-results">No blogs found matching "{searchTerm}"</p>
        )}
      </section>
    </div>
  );
};

export default Home;
