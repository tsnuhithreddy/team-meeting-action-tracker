const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');

class AuthService {
  // Authenticate user credentials and issue a signed JWT
  static async login(email, password) {
    // 1. Check if user exists in database
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Check if account is active
    if (!user.is_active) {
      throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
    }

    // 3. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 4. Generate JWT payload
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return token and sanitized user object (never return password_hash)
    return {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    };
  }

  // Get currently logged-in user profile
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at
    };
  }
}

module.exports = AuthService;