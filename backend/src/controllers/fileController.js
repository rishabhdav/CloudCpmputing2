const File = require('../models/File');
const { processImage, processPdf } = require('../utils/processFile');
const cloudinary = require('../config/cloudinary');

const uploadAndProcessFile = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file.');
    }

    let processedResult;

    if (req.file.mimetype.startsWith('image/')) {
      processedResult = await processImage(req.file);
    } else if (req.file.mimetype === 'application/pdf') {
      processedResult = await processPdf(req.file);
    } else {
      res.status(400);
      throw new Error('Unsupported file type.');
    }

    const savedFile = await File.create({
      userId: req.user.id,
      userName: req.user.name,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      cloudinaryUrl: processedResult.url,
      cloudinaryPublicId: processedResult.publicId,
      processingType: processedResult.processingType,
      extractedText: processedResult.extractedText
    });

    res.status(201).json(savedFile);
  } catch (error) {
    next(error);
  }
};

const getAllFiles = async (req, res, next) => {
  try {
    const files = await File.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!file) {
      res.status(404);
      throw new Error('File not found for this user.');
    }

    const resourceType = file.mimeType === 'application/pdf' ? 'raw' : 'image';

    await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
      resource_type: resourceType
    });

    await File.findByIdAndDelete(file._id);

    res.status(200).json({ message: 'File deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndProcessFile,
  getAllFiles,
  deleteFile
};
