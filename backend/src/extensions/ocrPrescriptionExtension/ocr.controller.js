// extensions/ocrPrescriptionExtension/ocr.controller.js
const { success } = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

const ocrService = require('./ocr.service');
const parserService = require('./prescriptionParser.service');
const validationService = require('./validation.service');
const storageService = require('./ocrStorage.service');
const injectorService = require('./medicationInjector.service');

exports.uploadAndProcess = async (req, res) => {
  logger.info('OCR Auto-Entry: Received new prescription upload request');

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No prescription image provided.' });
    }

    // Usually caregiverId is req.user.id. Since patients usually don't self-inject auto DB? 
    // We expect patientId in body
    const patientId = req.body.patientId;
    const uploadedBy = req.user.id;

    if (!patientId) {
       return res.status(400).json({ success: false, message: 'patientId is required in form-data for tagging.' });
    }

    // Step 1: Execute OCR Text Extraction (LLM Vision)
    const rawText = await ocrService.extractDetailedText(req.file.buffer, req.file.mimetype);
    
    // Step 2: Parse raw text into structured JSON instances
    const parsedStructure = await parserService.parseToJSON(rawText);

    // Step 3: Validate outputs formally
    const validatedMedicines = validationService.validateMedicines(parsedStructure);

    // Flow Control: Dry Run mode just returns the extracted logic without executing DB mapping (used for Previews)
    const isDryRun = req.query.dryRun === 'true';

    // Step 4: Storage logging (Save dataset instance regardless of injection)
    const ocrRecord = await storageService.saveRecord(
      patientId, 
      uploadedBy, 
      rawText, 
      validatedMedicines, 
      isDryRun ? 'preview' : 'injected'
    );

    // Step 5: Native Medication Injection (Only if NOT DryRun)
    let finalResultData = validatedMedicines;
    let message = 'Prescription successfully previewed (Dry Run).';

    if (!isDryRun) {
      finalResultData = await injectorService.injectAll(patientId, uploadedBy, validatedMedicines);
      message = 'Prescription medications generated and injected successfully.';
    }

    return success(res, { recordId: ocrRecord?._id, medications: finalResultData, isDryRun }, message);

  } catch (err) {
    logger.error('OCR Pipeline Controller halted due to error: ' + err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
