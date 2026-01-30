const express = require('express');
const multer = require('multer');
const tesseract = require('node-tesseract-ocr');
const sharp = require('sharp');  ← ADD

const app = express();
const upload = multer({ dest: '/tmp/' });

app.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    const lang = req.query.lang || 'vie';
    
    // PREPROCESSING cho CAPTCHA/normal text
    const processedPath = `/tmp/processed_${req.file.filename}.png`;
    await sharp(req.file.path)
      .greyscale()                    // Chuyển grayscale
      .normalize()                   // Tăng contrast
      .blur(0.3)                     // Giảm noise nhẹ
      .threshold(128)                // Binarize (đen trắng)
      .resize(800)                   // Scale up để dễ đọc
      .png()                         // Convert PNG cho Tesseract
      .toFile(processedPath);

    // OCR với config tối ưu
    const text = await tesseract.recognize(processedPath, {
      lang: lang,
      tessedit_pageseg_mode: '6',    // Single block text (CAPTCHA)
      tessedit_char_whitelist: lang === 'vie' 
        ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ' 
        : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    });

    res.json({ 
      text: text.trim(),
      lang: lang,
      original: req.file.filename,
      processed: processedPath,
      confidence: 'improved'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OCR API with preprocessing running on port ${PORT}`);
});
