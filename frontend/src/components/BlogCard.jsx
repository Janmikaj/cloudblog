import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  return (
    <div className="card h-100 bg-dark text-white border-secondary shadow-sm hover-effect">
      {blog.imageUrl && (
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <img 
            src={blog.imageUrl} 
            alt={blog.title} 
            className="card-img-top h-100 w-100 object-fit-cover" 
          />
        </div>
      )}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold">{blog.title}</h5>
        <p className="card-text text-muted small mb-2">
          By {blog.author} on {new Date(blog.createdAt).toLocaleDateString()}
        </p>
        <p className="card-text text-light flex-grow-1">
          {blog.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
        </p>
        <Link to={`/blog/${blog._id}`} className="btn btn-outline-primary mt-3 w-100 rounded-pill">
          Read More
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
