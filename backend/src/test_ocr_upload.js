const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testOCR() {
  const form = new FormData();
  
  // Create a 1px transparent PNG to test the pipeline without an actual PDF
  // This helps test if the endpoints connect perfectly while ensuring minimum AI processing payload
  const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "base64");
  
  form.append('image', buffer, { filename: 'test.png', contentType: 'image/png' });
  form.append('patientId', '5f8d04f1b54764001cfd67db');

  try {
    const res = await axios.post('http://localhost:5000/api/extensions/ocr/upload?dryRun=true', form, {
      headers: {
        ...form.getHeaders(),
        // Mocking an admin or caregiver token is hard unless we have one. We can bypass by using a test user?
        // Wait, 'protect' middleware requires a valid JWT token!
      }
    });

    console.log('SUCCESS:', res.data);
  } catch (err) {
    if (err.response) {
      console.log('API Error:', err.response.status, err.response.data);
    } else {
      console.log('Network Error:', err.message);
    }
  }
}

testOCR();
