const express = require('express');
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');

const app = express();
const upload = multer({ dest: '/tmp/' });

app.post('/ocr', upload.single('image'), async (req, res) => {
  try {
    const text = await tesseract.recognize(req.file.path, {
      lang: 'eng+vie',
    });
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tesseract API running on port ${PORT}`);
});
