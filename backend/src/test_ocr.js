const express = require('express');
const bootstrapExtensions = require('./bootstrapExtensions');

const app = express();
try {
  bootstrapExtensions(app);
  let hasOCR = false;
  app._router.stack.forEach(r => {
    if (r.name === 'router' && r.regexp.test('/api/v1/ocr')) {
      hasOCR = true;
    }
  });

  if (hasOCR) {
    console.log('✅ OCR Route successfully registered via bootstrap');
    process.exit(0);
  } else {
    console.error('❌ OCR Route NOT found in Express stack');
    process.exit(1);
  }
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
