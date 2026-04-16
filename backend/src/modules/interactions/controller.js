// modules/interactions/controller.js
const InteractionFlag = require('./model');
const { success } = require('../../utils/apiResponse');

exports.getByPatient = async (req, res) => {
  const flags = await InteractionFlag.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
  success(res, flags);
};

exports.acknowledge = async (req, res) => {
  const flag = await InteractionFlag.findByIdAndUpdate(
    req.params.id,
    { acknowledged: true, acknowledgedBy: req.user.id, acknowledgedAt: new Date() },
    { new: true }
  );
  success(res, flag, 'Interaction flag acknowledged');
};
