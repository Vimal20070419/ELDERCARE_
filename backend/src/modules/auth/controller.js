// modules/auth/controller.js
const authService = require('./service');
const { success } = require('../../utils/apiResponse');

exports.register = async (req, res) => {
  const result = await authService.register(req.body);
  success(res, result, 'Registered successfully', 201);
};

exports.login = async (req, res) => {
  const result = await authService.login(req.body);
  success(res, result, 'Logged in successfully');
};

exports.getMe = async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  success(res, user);
};

exports.requestOTP = async (req, res) => {
  const result = await authService.requestOTP(req.body);
  success(res, result, 'OTP requested successfully');
};

exports.verifyOTP = async (req, res) => {
  const result = await authService.verifyOTP(req.body);
  success(res, result, 'Identity verified successfully');
};

exports.updatePrefs = async (req, res) => {
  const user = await authService.updateUser(req.user.id, req.body);
  success(res, user, 'Preferences updated');
};

exports.refreshToken = async (req, res) => {
  const result = await authService.refreshToken(req.user.id);
  success(res, result, 'Token refreshed');
};
