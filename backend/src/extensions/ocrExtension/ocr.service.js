const { GoogleGenAI } = require('@google/genai');
const logger = require('../../utils/logger');

class OCRService {
  async scanPrescription(fileBuffer, mimeType) {
    try {
      logger.info('OCR Service: Processing image via Gemini 2.5 Flash');

      if (!process.env.GEMINI_API_KEY) {
        logger.warn('OCR processing skipped: GEMINI_API_KEY is not set in backend/.env');
        throw new Error('GEMINI_API_KEY is not configured');
      }

      // Initialize GenAI client at runtime
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Convert buffer to base64
      const base64Image = fileBuffer.toString('base64');

      const prompt = `
      Extract the prescription or medication details from this image and return ONLY a JSON object.
      Do not include any Markdown wrappers like \`\`\`json.
      If a field is not found, leave it as an empty string.

      Required JSON schema:
      {
        "name": "string (the generic or main drug name)",
        "brandName": "string (brand name if applicable)",
        "dosage": "string (e.g., 5mg, 10ml)",
        "frequency": "string (try to map to: 'Once daily', 'Twice daily', 'Three times daily', 'Every 4 hours', 'Every 6 hours', 'Weekly', 'As needed')",
        "instructions": "string (any extra instructions, take with water, etc)"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ]
      });

      let text = response.text || '';
      // Clean up markdown if the AI includes it despite instructions
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsed = JSON.parse(text);
      logger.info('OCR Service: Information extracted successfully');
      return parsed;

    } catch (err) {
      logger.error(`OCR processing failed: ${err.message}`);
      throw new Error(`Failed to process image: ${err.message}`);
    }
  }
}

module.exports = new OCRService();
