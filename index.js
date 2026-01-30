app.post('/captcha', upload.single('file'), async (req, res) => {
  try {
    // CAPTCHA preprocessing pipeline
    const processedPath = `/tmp/captcha_${req.file.filename}.png`;
    
    await sharp(req.file.path)
      // 1. Morphological operations cho CAPTCHA
      .raw()
      .ensureAlpha()
      .removeAlpha()  // Remove transparency
      .greyscale()
      .negate()       // Đảo màu (text trắng, bg đen)
      .blur(0.8)      // Heavy blur để smooth curves
      .threshold(140) // Aggressive threshold
      .resize(1200, 80, {  // Stretch horizontally
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false
      })
      .png()
      .toFile(processedPath);

    const text = await tesseract.recognize(processedPath, {
      lang: 'eng',  // CAPTCHA thường chỉ Latin chars
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      tessedit_pageseg_mode: '8',  // Single word/line
      tessedit_single_match: '1'
    });

    res.json({ 
      text: text.trim(),
      captcha_mode: true,
      processed: processedPath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
