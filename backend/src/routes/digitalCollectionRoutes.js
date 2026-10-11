const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const DigitalCollectionController = require('../controllers/DigitalCollectionController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/appConstants');
const { getUploadDirectory } = require('../utils/uploadDirectories');

const router = express.Router();
const uploadDirectory = getUploadDirectory('digital-objects');

const mimeByExtension = { '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),
  filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { files: 15, fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!mimeByExtension[extension] || mimeByExtension[extension] !== file.mimetype) {
      return callback(new Error('Only PDF, PNG, and JPEG files are accepted'));
    }
    callback(null, true);
  },
});
const staffOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN)];

router.get('/public/objects', DigitalCollectionController.getPublicObjects);
router.get('/public/collections', DigitalCollectionController.getPublicCollections);
router.get('/public/objects/:objectId/file', DigitalCollectionController.getPublicFile);
router.get('/public/objects/:objectId/download', DigitalCollectionController.downloadPublicFile);
router.get('/admin/analytics', ...staffOnly, DigitalCollectionController.getAnalytics);
router.get('/admin/export.csv', ...staffOnly, DigitalCollectionController.exportObjects);

router.get('/collections', ...staffOnly, DigitalCollectionController.getCollections);
router.post('/collections', ...staffOnly, DigitalCollectionController.createCollection);
router.put('/collections/:collectionId', ...staffOnly, DigitalCollectionController.updateCollection);
router.get('/collections/:collectionId/objects', ...staffOnly, DigitalCollectionController.getObjects);
router.post('/collections/:collectionId/objects', ...staffOnly, upload.array('files', 15), DigitalCollectionController.uploadObjects);
router.get('/objects/:objectId/rights-history', ...staffOnly, DigitalCollectionController.getRightsHistory);
router.get('/objects/:objectId/file', ...staffOnly, DigitalCollectionController.getInternalFile);
router.get('/objects/:objectId/download', ...staffOnly, DigitalCollectionController.downloadInternalFile);
router.put('/objects/:objectId', ...staffOnly, DigitalCollectionController.updateObject);
router.patch('/objects/:objectId', ...staffOnly, DigitalCollectionController.setPublicStatus);
router.delete('/objects/:objectId', ...staffOnly, DigitalCollectionController.deleteObject);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.message === 'Only PDF, PNG, and JPEG files are accepted') {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
});

module.exports = router;