const ocrService = require('./ocr.service');
const { success } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

exports.scanPrescripton = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }

  try {
    const extractedData = await ocrService.scanPrescription(req.file.buffer, req.file.mimetype);
    success(res, extractedData, 'Prescription scanned successfully');
  } catch (err) {
    logger.error('OCR Controller error: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
