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

const mimeByExtension = {
  '.pdf': { type: 'application/pdf' },
  '.png': { type: 'image/png' },
  '.jpg': { type: 'image/jpeg' },
  '.jpeg': { type: 'image/jpeg' },
  '.gif': { type: 'image/gif' },
  '.webp': { type: 'image/webp' },
  '.bmp': { type: 'image/bmp', aliases: ['image/x-ms-bmp'] },
  '.tif': { type: 'image/tiff' },
  '.tiff': { type: 'image/tiff' },
  '.mp4': { type: 'video/mp4' },
  '.webm': { type: 'video/webm' },
  '.mov': { type: 'video/quicktime' },
  '.m4v': { type: 'video/x-m4v', aliases: ['video/mp4'] },
  '.mp3': { type: 'audio/mpeg' },
  '.m4a': { type: 'audio/mp4', aliases: ['audio/x-m4a'] },
  '.wav': { type: 'audio/wav', aliases: ['audio/x-wav'] },
  '.ogg': { type: 'audio/ogg' },
  '.aac': { type: 'audio/aac', aliases: ['audio/x-aac'] },
  '.flac': { type: 'audio/flac', aliases: ['audio/x-flac'] },
  '.docx': { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', aliases: ['application/zip'] },
  '.xlsx': { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', aliases: ['application/zip'] },
  '.pptx': { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', aliases: ['application/zip'] },
  '.doc': { type: 'application/msword' },
  '.xls': { type: 'application/vnd.ms-excel', aliases: ['application/x-ole-storage'] },
  '.ppt': { type: 'application/vnd.ms-powerpoint' },
  '.odt': { type: 'application/vnd.oasis.opendocument.text', aliases: ['application/zip'] },
  '.ods': { type: 'application/vnd.oasis.opendocument.spreadsheet', aliases: ['application/zip'] },
  '.odp': { type: 'application/vnd.oasis.opendocument.presentation', aliases: ['application/zip'] },
  '.txt': { type: 'text/plain' },
  '.md': { type: 'text/markdown', aliases: ['text/plain'] },
  '.csv': { type: 'text/csv', aliases: ['application/vnd.ms-excel', 'text/plain'] },
  '.rtf': { type: 'application/rtf', aliases: ['text/rtf'] },
};
const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDirectory),
  filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
});
const upload = multer({
  storage,
  limits: { files: 15, fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const acceptedType = mimeByExtension[extension];
    const genericMimeTypes = ['application/octet-stream', 'application/zip'];
    if (!acceptedType || (file.mimetype
      && file.mimetype !== acceptedType.type
      && !acceptedType.aliases?.includes(file.mimetype)
      && !genericMimeTypes.includes(file.mimetype))) {
      return callback(new Error('This file extension and MIME type are not supported'));
    }
    file.mimetype = acceptedType.type;
    callback(null, true);
  },
});
const staffOnly = [authenticate, authorize(ROLES.ADMIN, ROLES.LIBRARIAN)];

router.get('/public/objects', DigitalCollectionController.getPublicObjects);
router.get('/public/collections', DigitalCollectionController.getPublicCollections);
router.get('/public/objects/:objectId/file', DigitalCollectionController.getPublicFile);
router.get('/public/objects/:objectId/download', DigitalCollectionController.downloadPublicFile);
router.get('/admin/analytics', ...staffOnly, DigitalCollectionController.getAnalytics);
router.get('/admin/audit-logs', ...staffOnly, DigitalCollectionController.getAuditLogs);
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
  if (error.message === 'This file extension and MIME type are not supported') {
    return res.status(400).json({ success: false, message: error.message });
  }
  next(error);
});

module.exports = router;