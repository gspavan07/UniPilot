const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes (require authentication)
router.get('/me', authenticate, authController.getProfile.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

module.exports = router;
