const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');
const { query } = require('../config/db');

class UserService {
  // Get all active users
  static async getAllUsers() {
    return await UserModel.findAll();
  }

  // Create new user account (Admin only)
  static async createUser({ fullName, email, password, roleId }) {
    // Check if email already registered
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError('A user with this email address already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (full_name, email, password_hash, role_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await query(sql, [fullName, email, passwordHash, roleId]);
    return await UserModel.findById(result.insertId);
  }

  // Deactivate user account (Admin only)
  static async deactivateUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    await query('UPDATE users SET is_active = FALSE WHERE id = ?', [userId]);
    return true;
  }
}

module.exports = UserService;