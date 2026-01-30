const express = require('express');
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');
const sharp = require('sharp');  // Preprocessing

const app = express();  // ← Phải có dòng này ĐẦU FILE
const upload = multer({ dest: '/tmp/' });

app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Normal OCR endpoint
app.post('/', upload.single('file'), async (req, res) => {
  try {
    const lang = req.query.lang || 'vie';
    
    // Preprocessing
    const processedPath = `/tmp/processed_${req.file.filename}.png`;
    await sharp(req.file.path)
      .greyscale()
      .normalize()
      .blur(0.3)
      .threshold(128)
      .resize(800)
      .png()
      .toFile(processedPath);

    const text = await tesseract.recognize(processedPath, {
      lang: lang,
      tessedit_pageseg_mode: '6'
    });

    res.json({ 
      text: text.trim(),
      lang: lang,
      confidence: 'improved'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CAPTCHA specialist endpoint
app.post('/captcha', upload.single('file'), async (req, res) => {
  try {
    const processedPath = `/tmp/captcha_${req.file.filename}.png`;
    
    await sharp(req.file.path)
      .raw().ensureAlpha().removeAlpha()
      .greyscale()
      .negate()
      .blur(0.8)
      .threshold(140)
      .resize(1200, 80, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(processedPath);

    const text = await tesseract.recognize(processedPath, {
      lang: 'eng',
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      tessedit_pageseg_mode: '8'
    });

    res.json({ 
      text: text.trim(),
      captcha_mode: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OCR API running on port ${PORT}`);
});
