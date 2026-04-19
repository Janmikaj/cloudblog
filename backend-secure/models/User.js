const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  // Intentional Vulnerability: Storing password as plain text
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  }
});

module.exports = mongoose.model('User', userSchema);
