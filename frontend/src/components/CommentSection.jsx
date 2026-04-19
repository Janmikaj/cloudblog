import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CommentSection = ({ blogId }) => {
  const [commentsList, setCommentsList] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const authorName = user ? user.username : 'Anonymous';
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/${blogId}`);
      setCommentsList(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;

    try {
      await api.post('/comments', { blogId, name: authorName, comment });
      setComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea 
          placeholder="Your Comment (HTML allowed!)" 
          value={comment} 
          onChange={(e) => setComment(e.target.value)}
          className="form-input"
          rows="3"
        ></textarea>
        <button type="submit" className="btn-primary">Post Comment</button>
      </form>
      
      <div className="comments-list">
        {commentsList.length === 0 ? (
          <p>No comments yet. Be the first!</p>
        ) : (
          commentsList.map((c) => (
            <div key={c._id} className="comment">
              <div className="comment-header">
                <strong>{c.name}</strong>
                <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              {/* Intentional XSS Vulnerability */}
              <div 
                className="comment-body"
                dangerouslySetInnerHTML={{ __html: c.comment }} 
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
