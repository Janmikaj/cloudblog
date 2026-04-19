import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  return (
    <div className="blog-card">
      {blog.imageUrl && (
        <div className="blog-card-image-wrapper">
          <img src={blog.imageUrl} alt={blog.title} className="blog-card-image" />
        </div>
      )}
      <div className="blog-card-content">
        <h2 className="blog-title">{blog.title}</h2>
        <p className="blog-meta">By {blog.author} on {new Date(blog.createdAt).toLocaleDateString()}</p>
        <p className="blog-excerpt">
          {blog.content.replace(/<[^>]+>/g, '').substring(0, 120)}...
        </p>
        <Link to={`/blog/${blog._id}`} className="btn-read-more">Read More</Link>
      </div>
    </div>
  );
};

export default BlogCard;
