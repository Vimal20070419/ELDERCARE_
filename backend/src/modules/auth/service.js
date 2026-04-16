// modules/auth/service.js — Authentication business logic
const User = require('./model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async register({ name, email, phone, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 400 });

    const user = await User.create({ name, email, phone, passwordHash: password, role });
    const token = this.generateToken(user);
    return { token, user: user.toSafeObject() };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }
    const token = this.generateToken(user);
    return { token, user: user.toSafeObject() };
  }

  async getUserById(id) {
    const user = await User.findById(id).select('-passwordHash');
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  }

  async requestOTP({ phone }) {
    const user = await User.findOne({ phone });
    if (!user) throw Object.assign(new Error('User with this phone not found'), { statusCode: 404 });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await user.save();

    // Trigger SMS simulation
    const smsService = require('../../services/sms.service');
    await smsService.send(user.phone, `Your ElderCare login code is: ${otp}. Valid for 5 minutes.`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOTP({ phone, otp }) {
    const user = await User.findOne({ phone, otpCode: otp, otpExpires: { $gt: new Date() } });
    if (!user) throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 401 });

    // Clear OTP
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    const token = this.generateToken(user);
    return { token, user: user.toSafeObject() };
  }

  async refreshToken(id) {
    const user = await User.findById(id);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    const token = this.generateToken(user);
    return { token, user: user.toSafeObject() };
  }

  async updateUser(id, updates) {
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-passwordHash');
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  }
}

module.exports = new AuthService();
