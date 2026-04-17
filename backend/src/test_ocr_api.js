const axios = require('axios');
const jwt = require('jsonwebtoken');
const FormData = require('form-data');

// Mock a JWT token exactly as the protect middleware expects
const token = jwt.sign(
  { id: '60d0fe4f5311236168a109ca', role: 'caregiver' },
  process.env.JWT_SECRET || 'eldercare_super_secret_jwt_key_2024',
  { expiresIn: '1h' }
);

async function run() {
  try {
    const form = new FormData();
    // 1px transparent PNG base64
    const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=", "base64");
    form.append('image', buffer, { filename: 'test.png', contentType: 'image/png' });
    form.append('patientId', '5f8d04f1b54764001cfd67db');

    console.log('Sending request to http://localhost:5000/api/extensions/ocr/upload?dryRun=true...');
    const res = await axios.post('http://localhost:5000/api/extensions/ocr/upload?dryRun=true', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('--- SUCCESS RESPONSE ---');
    console.log(res.data);
  } catch (err) {
    console.log('--- ERROR THROWN ---');
    if (err.response) {
      console.log('status:', err.response.status);
      console.log('data:', err.response.data);
    } else {
      console.log('network error:', err.message);
    }
  }
}

run();
