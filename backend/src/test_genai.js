require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({});
    console.log('AI client initialized successfully');
    
    const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        'Extract text and return {"name": "test"}',
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png'
          }
        }
      ]
    });
    console.log('Response:', response.text);
  } catch (err) {
    console.error('Error during AI execution:', err);
  }
}

test();
