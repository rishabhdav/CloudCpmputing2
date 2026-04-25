const express = require('express');

const upload = require('../middleware/upload');
const { deleteFile, getAllFiles, uploadAndProcessFile } = require('../controllers/fileController');

const router = express.Router();

router.get('/', getAllFiles);
router.post('/upload', upload.single('file'), uploadAndProcessFile);
router.delete('/:id', deleteFile);

module.exports = router;
