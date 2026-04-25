const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });

    uploadStream.end(buffer);
  });

const processImage = async (file) => {
  // Compress and resize large images while preserving quality.
  const optimizedBuffer = await sharp(file.buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();

  const uploadedImage = await uploadBufferToCloudinary(optimizedBuffer, {
    folder: 'serverless-file-processor/images',
    resource_type: 'image'
  });

  return {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id,
    processingType: 'image-compressed',
    extractedText: ''
  };
};

const processPdf = async (file) => {
  const parsedPdf = await pdfParse(file.buffer);

  const uploadedPdf = await uploadBufferToCloudinary(file.buffer, {
    folder: 'serverless-file-processor/pdfs',
    resource_type: 'raw',
    public_id: file.originalname.replace(/\.[^/.]+$/, '')
  });

  return {
    url: uploadedPdf.secure_url,
    publicId: uploadedPdf.public_id,
    processingType: 'pdf-text-extracted',
    extractedText: parsedPdf.text.slice(0, 1500) // Keep response/database lightweight.
  };
};

module.exports = {
  processImage,
  processPdf
};
