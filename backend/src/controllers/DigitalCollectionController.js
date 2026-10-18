const fs = require('fs');
const path = require('path');
const DigitalCollectionModel = require('../models/DigitalCollectionModel');
const DigitalCollectionStorageService = require('../services/DigitalCollectionStorageService');
const { sendSuccess, sendError } = require('../utils/response');

function sendObjectFile(res, object, download = false) {
  res.type(object.mime_type);
  const disposition = download ? 'attachment' : 'inline';
  res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(object.original_filename)}"`);
  if (object.storage_provider === 'cloudinary') {
    res.setHeader('Cache-Control', 'private, no-store');
    return DigitalCollectionStorageService.streamCloudinaryObject(res, object, download).catch((error) => {
      console.error('Cloudinary digital file delivery failed:', error.message);
      if (res.headersSent) {
        res.destroy(error);
        return;
      }
      res.removeHeader('Content-Disposition');
      res.removeHeader('Cache-Control');
      return sendError(res, 'Digital object file is temporarily unavailable', 502);
    });
  }
  const filePath = DigitalCollectionStorageService.localPath(object);
  if (!fs.existsSync(filePath)) return sendError(res, 'Digital object file not found', 404);
  return res.sendFile(filePath);
}

function validDate(value) {
  if (value == null || value === '') return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

async function hasValidFileSignature(file) {
  const handle = await fs.promises.open(file.path, 'r');
  try {
    const header = Buffer.alloc(12);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (file.mimetype === 'application/pdf') return header.subarray(0, 5).toString() === '%PDF-' && bytesRead >= 5;
    if (file.mimetype === 'image/png') return header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (file.mimetype === 'image/jpeg') return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    if (file.mimetype === 'image/gif') {
      return ['GIF87a', 'GIF89a'].includes(header.subarray(0, 6).toString());
    }
    if (file.mimetype === 'image/webp') {
      return header.subarray(0, 4).toString() === 'RIFF' && header.subarray(8, 12).toString() === 'WEBP';
    }
    if (file.mimetype === 'image/bmp') return header.subarray(0, 2).toString() === 'BM';
    if (file.mimetype === 'image/tiff') {
      return ['II*\u0000', 'MM\u0000*'].includes(header.subarray(0, 4).toString());
    }
    if (file.mimetype === 'video/mp4') return bytesRead >= 12 && header.subarray(4, 8).toString() === 'ftyp';
    if (file.mimetype === 'video/webm') return header.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    if (file.mimetype === 'video/quicktime' || file.mimetype === 'video/x-m4v') {
      return bytesRead >= 12 && header.subarray(4, 8).toString() === 'ftyp';
    }
    if (file.mimetype === 'audio/mpeg') return header.subarray(0, 3).toString() === 'ID3'
      || (header[0] === 0xff && (header[1] & 0xe0) === 0xe0);
    if (file.mimetype === 'audio/mp4') return bytesRead >= 12 && header.subarray(4, 8).toString() === 'ftyp';
    if (file.mimetype === 'audio/aac') return header[0] === 0xff && (header[1] & 0xf6) === 0xf0;
    if (file.mimetype === 'audio/flac') return header.subarray(0, 4).toString() === 'fLaC';
    if (file.mimetype === 'audio/wav' || file.mimetype === 'audio/x-wav') {
      return header.subarray(0, 4).toString() === 'RIFF' && header.subarray(8, 12).toString() === 'WAVE';
    }
    if (file.mimetype === 'audio/ogg') return header.subarray(0, 4).toString() === 'OggS';
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      || file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      || file.mimetype === 'application/vnd.oasis.opendocument.text'
      || file.mimetype === 'application/vnd.oasis.opendocument.spreadsheet'
      || file.mimetype === 'application/vnd.oasis.opendocument.presentation') {
      return header.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    }
    if (file.mimetype === 'application/msword'
      || file.mimetype === 'application/vnd.ms-excel'
      || file.mimetype === 'application/vnd.ms-powerpoint') {
      return header.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
    }
    if (file.mimetype === 'application/rtf' || file.mimetype === 'text/rtf') {
      return header.subarray(0, 5).toString() === '{\\rtf';
    }
    if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown' || file.mimetype === 'text/csv') {
      return bytesRead > 0 && !header.subarray(0, bytesRead).includes(0);
    }
    return false;
  } finally {
    await handle.close();
  }
}

const materialTypes = [
  'Historical Photograph', 'Newsletter', 'Report', 'Newspaper Clipping',
  'Exam Paper', 'Poster', 'Local-History Document',
];
const rightsStatuses = ['Public Domain', 'Copyrighted - Permitted', 'Sensitive - Restricted'];

function csvCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

class DigitalCollectionController {
  static async getCollections(req, res, next) {
    try {
      const collections = await DigitalCollectionModel.findCollections();
      sendSuccess(res, 'Digital collections retrieved', { collections });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicCollections(req, res, next) {
    try {
      const collections = await DigitalCollectionModel.findPublicCollections();
      sendSuccess(res, 'Public digital collections retrieved', { collections });
    } catch (error) {
      next(error);
    }
  }

  static async createCollection(req, res, next) {
    try {
      const { title, description, selection_criteria, collection_value } = req.body;
      if (![title, selection_criteria, collection_value].every((value) => typeof value === 'string' && value.trim())) {
        return sendError(res, 'Title, selection criteria, and collection value are required', 400);
      }
      const collection_id = await DigitalCollectionModel.createCollection({
        title: title.trim(), description, selection_criteria: selection_criteria.trim(), collection_value: collection_value.trim(),
      });
      sendSuccess(res, 'Digital collection created', { collection_id }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCollection(req, res, next) {
    try {
      const { title, description, selection_criteria, collection_value } = req.body;
      if (![title, selection_criteria, collection_value].every((value) => typeof value === 'string' && value.trim())) {
        return sendError(res, 'Title, selection criteria, and collection value are required', 400);
      }
      if (!await DigitalCollectionModel.findCollectionById(req.params.collectionId)) {
        return sendError(res, 'Digital collection not found', 404);
      }
      const updated = await DigitalCollectionModel.updateCollection(req.params.collectionId, {
        title: title.trim(), description, selection_criteria: selection_criteria.trim(), collection_value: collection_value.trim(),
      });
      sendSuccess(res, 'Digital collection updated');
    } catch (error) {
      next(error);
    }
  }

  static async getObjects(req, res, next) {
    try {
      const collection = await DigitalCollectionModel.findCollectionById(req.params.collectionId);
      if (!collection) return sendError(res, 'Digital collection not found', 404);
      const objects = await DigitalCollectionModel.findObjects(req.params.collectionId);
      sendSuccess(res, 'Digital objects retrieved', { objects });
    } catch (error) {
      next(error);
    }
  }

  static async uploadObjects(req, res, next) {
    const files = req.files || [];
    try {
      const collection = await DigitalCollectionModel.findCollectionById(req.params.collectionId);
      if (!collection) {
        files.forEach((file) => fs.rmSync(file.path, { force: true }));
        return sendError(res, 'Digital collection not found', 404);
      }

      let metadata;
      try {
        metadata = JSON.parse(req.body.metadata || '');
      } catch {
        metadata = null;
      }
      const validMetadata = Array.isArray(metadata)
        && metadata.length === files.length
        && metadata.every((item) => item
          && typeof item.title === 'string' && item.title.trim()
          && materialTypes.includes(item.material_type)
          && rightsStatuses.includes(item.rights_status)
          && typeof item.rights_assessment_notes === 'string' && item.rights_assessment_notes.trim()
          && typeof item.is_public === 'boolean'
          && validDate(item.rights_expires_at)
          && !(item.is_public && (item.rights_status === 'Sensitive - Restricted'
            || (item.rights_expires_at && item.rights_expires_at < new Date().toISOString().slice(0, 10)))));
      const batchSize = files.reduce((total, file) => total + file.size, 0);

      let validationError;
      if (!files.length) {
        validationError = 'Choose at least one file to upload';
      } else if (files.length > 15) {
        validationError = 'Upload no more than 15 files at a time';
      } else if (batchSize > 150 * 1024 * 1024) {
        validationError = 'The combined upload size cannot exceed 150 MB';
      } else if (!Array.isArray(metadata) || metadata.length !== files.length) {
        validationError = 'Each selected file must have matching metadata';
      } else if (req.body.rights_confirmed !== 'true') {
        validationError = 'Confirm the rights assessment before uploading';
      } else if (!validMetadata) {
        validationError = 'Complete the title, material type, rights status, notes, and access settings for every file';
      }

      if (validationError) {
        files.forEach((file) => fs.rmSync(file.path, { force: true }));
        return sendError(res, validationError, 400);
      }

      for (const file of files) {
        if (!await hasValidFileSignature(file)) {
          files.forEach((item) => fs.rmSync(item.path, { force: true }));
          return sendError(res, 'The file contents do not match its declared type', 400);
        }
      }

      const objects = [];
      try {
        for (const [index, file] of files.entries()) {
          const stored = await DigitalCollectionStorageService.store(file);
          objects.push({
            ...metadata[index],
            title: metadata[index].title.trim(),
            creator: typeof metadata[index].creator === 'string' ? metadata[index].creator.trim() : '',
            rights_assessment_notes: metadata[index].rights_assessment_notes.trim(),
            rights_evidence_reference: metadata[index].rights_evidence_reference || null,
            rights_expires_at: metadata[index].rights_expires_at || null,
            ...stored,
            original_filename: path.basename(file.originalname),
            mime_type: file.mimetype,
            file_size: file.size,
          });
        }
      } catch (error) {
        await Promise.all(objects.map((object) => DigitalCollectionStorageService.delete(object).catch(() => {})));
        files.forEach((file) => fs.rmSync(file.path, { force: true }));
        throw error;
      }

      try {
        await DigitalCollectionModel.createObjects(req.params.collectionId, objects, req.user.user_id);
      } catch (error) {
        await Promise.all(objects.map((object) => DigitalCollectionStorageService.delete(object).catch(() => {})));
        files.forEach((file) => fs.rmSync(file.path, { force: true }));
        throw error;
      }
      if (DigitalCollectionStorageService.isCloudinaryEnabled()) {
        files.forEach((file) => fs.rmSync(file.path, { force: true }));
      }
      sendSuccess(res, 'Digital objects uploaded', { count: objects.length }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicObjects(req, res, next) {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
      const collectionId = req.query.collection_id ? Number.parseInt(req.query.collection_id, 10) : null;
      if (collectionId !== null && (!Number.isInteger(collectionId) || collectionId < 1)) {
        return sendError(res, 'Invalid collection filter', 400);
      }
      if (req.query.material_type && !materialTypes.includes(req.query.material_type)) {
        return sendError(res, 'Invalid material type filter', 400);
      }
      const result = await DigitalCollectionModel.findPublicObjects({
        search: typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 160) : '',
        collectionId,
        materialType: req.query.material_type || '',
        sort: req.query.sort,
        limit,
        offset: (page - 1) * limit,
      });
      sendSuccess(res, 'Public digital objects retrieved', {
        ...result,
        pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicFile(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId, true);
      if (!object) return sendError(res, 'Public digital object not found', 404);
      await DigitalCollectionModel.recordEvent(object.object_id, 'view').catch((error) => console.error('Digital view tracking failed:', error.message));
      return sendObjectFile(res, object);
    } catch (error) {
      next(error);
    }
  }

  static async downloadPublicFile(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId, true);
      if (!object) return sendError(res, 'Public digital object not found', 404);
      await DigitalCollectionModel.recordEvent(object.object_id, 'download').catch((error) => console.error('Digital download tracking failed:', error.message));
      return sendObjectFile(res, object, true);
    } catch (error) {
      next(error);
    }
  }

  static async getInternalFile(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId);
      if (!object) return sendError(res, 'Digital object not found', 404);
      await DigitalCollectionModel.recordEvent(object.object_id, 'view', req.user.user_id).catch((error) => console.error('Digital view tracking failed:', error.message));
      return sendObjectFile(res, object);
    } catch (error) {
      next(error);
    }
  }

  static async downloadInternalFile(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId);
      if (!object) return sendError(res, 'Digital object not found', 404);
      await DigitalCollectionModel.recordEvent(object.object_id, 'download', req.user.user_id).catch((error) => console.error('Digital download tracking failed:', error.message));
      return sendObjectFile(res, object, true);
    } catch (error) {
      next(error);
    }
  }

  static async updateObject(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId);
      if (!object) return sendError(res, 'Digital object not found', 404);
      const allowed = [
        'title', 'creator', 'material_type', 'rights_status', 'rights_assessment_notes',
        'rights_evidence_reference', 'rights_expires_at', 'is_public', 'rights_review_confirmed',
      ];
      if (!Object.keys(req.body).length || Object.keys(req.body).some((key) => !allowed.includes(key))) {
        return sendError(res, 'No valid digital object fields supplied', 400);
      }
      const rightsFields = ['rights_status', 'rights_assessment_notes', 'rights_evidence_reference', 'rights_expires_at'];
      const rightsChanged = rightsFields.some((field) => Object.hasOwn(req.body, field));
      if (rightsChanged && req.body.rights_review_confirmed !== true) {
        return sendError(res, 'Confirm the updated rights assessment before saving', 400);
      }
      const changes = { ...req.body };
      delete changes.rights_review_confirmed;
      if (changes.title !== undefined && (typeof changes.title !== 'string' || !changes.title.trim())) {
        return sendError(res, 'Title is required', 400);
      }
      if (changes.title !== undefined && changes.title.trim().length > 255) {
        return sendError(res, 'Title must be 255 characters or fewer', 400);
      }
      if (changes.creator !== undefined && changes.creator !== null && typeof changes.creator !== 'string') {
        return sendError(res, 'Creator must be text', 400);
      }
      if (changes.rights_evidence_reference !== undefined && changes.rights_evidence_reference !== null
        && (typeof changes.rights_evidence_reference !== 'string' || changes.rights_evidence_reference.length > 500)) {
        return sendError(res, 'Rights evidence reference must be 500 characters or fewer', 400);
      }
      if (changes.material_type !== undefined && !materialTypes.includes(changes.material_type)) {
        return sendError(res, 'Invalid material type', 400);
      }
      if (changes.rights_status !== undefined && !rightsStatuses.includes(changes.rights_status)) {
        return sendError(res, 'Invalid rights status', 400);
      }
      if (changes.rights_assessment_notes !== undefined && (typeof changes.rights_assessment_notes !== 'string' || !changes.rights_assessment_notes.trim())) {
        return sendError(res, 'Rights assessment notes are required', 400);
      }
      if (changes.rights_expires_at !== undefined && !validDate(changes.rights_expires_at)) {
        return sendError(res, 'Rights expiry must be a valid date', 400);
      }
      const nextRights = changes.rights_status || object.rights_status;
      const nextPublic = changes.is_public === undefined ? Boolean(object.is_public) : changes.is_public;
      const nextExpiry = changes.rights_expires_at === undefined ? object.rights_expires_at : changes.rights_expires_at;
      if (changes.is_public !== undefined && typeof changes.is_public !== 'boolean') {
        return sendError(res, 'is_public must be a boolean', 400);
      }
      if (nextPublic && ((!object.rights_assessed && !rightsChanged) || nextRights === 'Sensitive - Restricted'
        || (nextExpiry && nextExpiry < new Date().toISOString().slice(0, 10)))) {
        return sendError(res, 'Objects need a current rights assessment and cannot be restricted or expired to be public', 400);
      }
      if (rightsChanged && !String(changes.rights_assessment_notes ?? object.rights_assessment_notes).trim()) {
        return sendError(res, 'Rights assessment notes are required', 400);
      }
      if (changes.title !== undefined) changes.title = changes.title.trim();
      if (changes.creator !== undefined) changes.creator = changes.creator?.trim() || null;
      if (changes.rights_assessment_notes !== undefined) changes.rights_assessment_notes = changes.rights_assessment_notes.trim();
      await DigitalCollectionModel.updateObject(req.params.objectId, changes, req.user.user_id, rightsChanged);
      sendSuccess(res, 'Digital object updated');
    } catch (error) {
      next(error);
    }
  }

  static async getRightsHistory(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId);
      if (!object) return sendError(res, 'Digital object not found', 404);
      const history = await DigitalCollectionModel.findRightsHistory(req.params.objectId);
      sendSuccess(res, 'Rights history retrieved', { history });
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req, res, next) {
    try {
      const end = req.query.to && /^\d{4}-\d{2}-\d{2}$/.test(req.query.to)
        ? new Date(`${req.query.to}T00:00:00Z`) : new Date();
      const start = req.query.from && /^\d{4}-\d{2}-\d{2}$/.test(req.query.from)
        ? new Date(`${req.query.from}T00:00:00Z`) : new Date(end.getTime() - 29 * 86400000);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        return sendError(res, 'Invalid analytics date range', 400);
      }
      const toExclusive = new Date(end.getTime() + 86400000);
      const analytics = await DigitalCollectionModel.getAnalytics(
        start.toISOString().slice(0, 19).replace('T', ' '),
        toExclusive.toISOString().slice(0, 19).replace('T', ' ')
      );
      sendSuccess(res, 'Digital collection analytics retrieved', analytics);
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
      const eventType = req.query.event_type || '';
      if (eventType && !['view', 'download'].includes(eventType)) {
        return sendError(res, 'Invalid audit event type', 400);
      }
      const result = await DigitalCollectionModel.findAuditEvents({
        eventType,
        search: typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 160) : '',
        limit,
        offset: (page - 1) * limit,
      });
      sendSuccess(res, 'Digital object audit logs retrieved', {
        ...result,
        pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportObjects(req, res, next) {
    try {
      const objects = await DigitalCollectionModel.findObjectsForExport();
      const fields = [
        ['collection_title', 'Collection'], ['selection_criteria', 'Selection criteria'],
        ['collection_value', 'Collection value'], ['object_id', 'Object ID'], ['title', 'Title'],
        ['creator', 'Creator'], ['material_type', 'Material type'], ['original_filename', 'File'],
        ['rights_status', 'Rights status'], ['rights_assessment_notes', 'Rights notes'],
        ['rights_evidence_reference', 'Rights evidence'], ['rights_expires_at', 'Rights expiry'],
        ['is_public', 'Public'], ['rights_reviewed_at', 'Rights reviewed at'],
        ['reviewer_email', 'Reviewed by'], ['created_at', 'Added at'],
      ];
      const lines = [fields.map(([, heading]) => csvCell(heading)).join(',')];
      objects.forEach((object) => lines.push(fields.map(([field]) => csvCell(object[field])).join(',')));
      res.type('text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="digital-collections-export.csv"');
      res.send(`\uFEFF${lines.join('\r\n')}`);
    } catch (error) {
      next(error);
    }
  }

  static async setPublicStatus(req, res, next) {
    try {
      if (typeof req.body.is_public !== 'boolean') return sendError(res, 'is_public must be a boolean', 400);
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId);
      if (!object) return sendError(res, 'Digital object not found', 404);
      if (req.body.is_public && (!object.rights_assessed || object.rights_status === 'Sensitive - Restricted')) {
        return sendError(res, 'Only rights-assessed, non-restricted objects can be made public', 400);
      }
      if (req.body.is_public && object.rights_expires_at && object.rights_expires_at < new Date().toISOString().slice(0, 10)) {
        return sendError(res, 'Objects with expired rights cannot be made public', 400);
      }
      await DigitalCollectionModel.setPublicStatus(req.params.objectId, req.body.is_public);
      sendSuccess(res, 'Digital object access updated');
    } catch (error) {
      next(error);
    }
  }

  static async deleteObject(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId);
      if (!object) return sendError(res, 'Digital object not found', 404);
      await DigitalCollectionModel.deleteObject(req.params.objectId);
      await DigitalCollectionStorageService.delete(object);
      sendSuccess(res, 'Digital object deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DigitalCollectionController;