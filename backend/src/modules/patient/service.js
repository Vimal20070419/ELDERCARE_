// modules/patient/service.js — Patient CRUD + lookup
const Patient = require('./model');
const User = require('../auth/model');

class PatientService {
  async create(data, caregiverId) {
    // Create a linked user account for the patient if no userId provided
    let userId = data.userId;
    if (!userId) {
      const passwordRaw = '123456';
      const user = await User.create({
        name: data.name,
        email: data.email,
        passwordHash: passwordRaw,
        role: 'patient',
      });
      userId = user._id;
    }
    const patient = await Patient.create({ ...data, userId, caregiverId });
    return patient;
  }

  async getByCaregiverId(caregiverId) {
    return await Patient.find({ caregiverId }).populate('userId', 'name email role');
  }

  async getById(patientId) {
    const patient = await Patient.findById(patientId).populate('userId', 'name email role');
    if (!patient) throw Object.assign(new Error('Patient not found'), { statusCode: 404 });
    return patient;
  }

  async getByUserId(userId) {
    return await Patient.findOne({ userId }).populate('userId', 'name email role');
  }

  async update(patientId, updates) {
    return await Patient.findByIdAndUpdate(patientId, updates, { new: true });
  }

  async getAllPatients() {
    return await Patient.find({}).populate('userId', 'name email role');
  }
}

module.exports = new PatientService();
