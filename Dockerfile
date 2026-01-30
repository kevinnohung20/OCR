FROM node:18-slim

# Install Tesseract
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-vie \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
