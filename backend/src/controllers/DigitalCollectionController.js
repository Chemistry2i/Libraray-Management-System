const fs = require('fs');
const path = require('path');
const DigitalCollectionModel = require('../models/DigitalCollectionModel');
const { sendSuccess, sendError } = require('../utils/response');

const uploadDirectory = path.join(__dirname, '../../uploads/digital-objects');

function sendObjectFile(res, object) {
  const filePath = path.join(uploadDirectory, path.basename(object.file_path));
  if (!fs.existsSync(filePath)) return sendError(res, 'Digital object file not found', 404);
  res.type(object.mime_type);
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(object.original_filename)}"`);
  return res.sendFile(filePath);
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
      const allowedMaterials = [
        'Historical Photograph', 'Newsletter', 'Report', 'Newspaper Clipping',
        'Exam Paper', 'Poster', 'Local-History Document',
      ];
      const allowedRights = ['Public Domain', 'Copyrighted - Permitted', 'Sensitive - Restricted'];
      const validMetadata = Array.isArray(metadata)
        && metadata.length === files.length
        && metadata.every((item) => item
          && typeof item.title === 'string' && item.title.trim()
          && allowedMaterials.includes(item.material_type)
          && allowedRights.includes(item.rights_status)
          && typeof item.rights_assessment_notes === 'string' && item.rights_assessment_notes.trim()
          && !(item.is_public && item.rights_status === 'Sensitive - Restricted'));

      if (!files.length || files.length > 15 || req.body.rights_confirmed !== 'true' || !validMetadata) {
        files.forEach((file) => fs.rmSync(file.path, { force: true }));
        return sendError(res, 'Upload requires 1–15 files, matching metadata, a completed rights assessment, and no public restricted items', 400);
      }

      const objects = files.map((file, index) => ({
        ...metadata[index],
        title: metadata[index].title.trim(),
        creator: typeof metadata[index].creator === 'string' ? metadata[index].creator.trim() : '',
        rights_assessment_notes: metadata[index].rights_assessment_notes.trim(),
        file_path: path.basename(file.filename),
        original_filename: path.basename(file.originalname),
        mime_type: file.mimetype,
        file_size: file.size,
      }));

      try {
        await DigitalCollectionModel.createObjects(req.params.collectionId, objects);
      } catch (error) {
        files.forEach((file) => fs.rmSync(file.path, { force: true }));
        throw error;
      }
      sendSuccess(res, 'Digital objects uploaded', { count: objects.length }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicObjects(req, res, next) {
    try {
      const objects = await DigitalCollectionModel.findPublicObjects();
      sendSuccess(res, 'Public digital objects retrieved', { objects });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicFile(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId, true);
      if (!object) return sendError(res, 'Public digital object not found', 404);
      return sendObjectFile(res, object);
    } catch (error) {
      next(error);
    }
  }

  static async getInternalFile(req, res, next) {
    try {
      const object = await DigitalCollectionModel.findObjectById(req.params.objectId);
      if (!object) return sendError(res, 'Digital object not found', 404);
      return sendObjectFile(res, object);
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
      fs.rmSync(path.join(uploadDirectory, object.file_path), { force: true });
      sendSuccess(res, 'Digital object deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DigitalCollectionController;