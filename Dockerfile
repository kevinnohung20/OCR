FROM ubuntu:22.04

# Install Tesseract và dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-vie \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /data

# Expose port nếu bạn build API service
EXPOSE 8080

# Default command
CMD ["tesseract", "--version"]
