const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const checkUserAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith('Bearer')) {
    try {
      const token = authorization.split(' ')[1];
      console.log("Authorization Token:", token);

      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Verified Token:", decoded);

      const { id } = decoded; 
      if (!id) {
        return res.status(401).json({ status: 'failed', message: 'Invalid Token Payload' });
      }

      console.log("Decoded User ID:", id);

      
      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({ status: 'failed', message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error verifying token:", error.message);
      return res.status(401).json({ status: 'failed', message: 'Unauthorized User' });
    }
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized User, No Token Provided',
    });
  }
};

module.exports = { checkUserAuth };
