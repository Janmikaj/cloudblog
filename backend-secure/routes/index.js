const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET || 'supersecuresecretkeythatshouldberandom', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

// POST /login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { identity, password } = req.body; // identity can be username or email
    
    // Prevent NoSQL Injection by ensuring types are strictly strings
    if (typeof identity !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    if (!identity || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    // Find by username or email
    const user = await User.findOne({ 
      $or: [{ username: identity }, { email: identity }] 
    });
    
    if (user) {
      // Check if password is correct
      let isMatch = false;
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        // Fallback for unhashed seeded users
        isMatch = (password === user.password);
      }

      if (isMatch) {
        const token = jwt.sign(
          { id: user._id, role: user.role, username: user.username },
          process.env.JWT_SECRET || 'supersecuresecretkeythatshouldberandom',
          { expiresIn: '1d' }
        );
        res.json({ message: 'Login successful', role: user.role, username: user.username, email: user.email, token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Validate password: min 6 chars, alphanumeric, special chars allowed
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters and contain both letters and numbers' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Role should default to 'user' if not provided
    const newUserRole = role && ['admin', 'editor', 'user'].includes(role) ? role : 'user';

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: newUserRole
    });

    await newUser.save();
    
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, username: newUser.username },
      process.env.JWT_SECRET || 'supersecuresecretkeythatshouldberandom',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ message: 'User registered successfully', role: newUser.role, username: newUser.username, email: newUser.email, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// GET /blogs - Fetch all blogs
router.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /blogs - Create blog (Secured with auth middleware)
router.post('/blogs', authenticateToken, async (req, res) => {
  try {
    const { title, content, author, imageUrl } = req.body;
    const blog = new Blog({ title, content, author, imageUrl });
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /blogs/:id - Update blog (Secured with auth middleware)
router.put('/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    const blog = await Blog.findByIdAndUpdate(req.params.id, { title, content, imageUrl }, { new: true });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /blogs/:id - Delete blog (Secured with auth middleware)
router.delete('/blogs/:id', authenticateToken, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /comments - Add comment (intentionally no input sanitization)
router.post('/comments', async (req, res) => {
  try {
    const { blogId, name, comment } = req.body;
    const newComment = new Comment({ blogId, name, comment });
    await newComment.save();
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /comments/:blogId - Fetch comments for a blog
router.get('/comments/:blogId', async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
