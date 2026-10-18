const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('../../models/DigitalCollectionModel', () => ({
  findPublicObjects: jest.fn(),
  findPublicCollections: jest.fn(),
  findAuditEvents: jest.fn(),
  findObjectById: jest.fn(),
  findCollectionById: jest.fn(),
  createObjects: jest.fn(),
  recordEvent: jest.fn(),
  setPublicStatus: jest.fn(),
  updateObject: jest.fn(),
}));

const DigitalCollectionModel = require('../../models/DigitalCollectionModel');
const DigitalCollectionController = require('../DigitalCollectionController');

function makeResponse() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    type() { return this; },
    setHeader() {},
    sendFile() { return this; },
    send() { return this; },
  };
}

function tempFile(contents) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-digital-object-'));
  const filePath = path.join(directory, 'upload.pdf');
  fs.writeFileSync(filePath, contents);
  return { directory, filePath };
}

beforeEach(() => jest.clearAllMocks());

describe('DigitalCollectionController', () => {
  test('applies validated public filters and returns pagination metadata', async () => {
    DigitalCollectionModel.findPublicObjects.mockResolvedValue({ objects: [], total: 0 });
    const req = { query: { page: '2', limit: '20', search: 'town', collection_id: '4', material_type: 'Report', sort: 'title' } };
    const res = makeResponse();

    await DigitalCollectionController.getPublicObjects(req, res, jest.fn());

    expect(DigitalCollectionModel.findPublicObjects).toHaveBeenCalledWith({
      search: 'town', collectionId: 4, materialType: 'Report', sort: 'title', limit: 20, offset: 20,
    });
    expect(res.body.data.pagination).toEqual({ page: 2, limit: 20, total: 0, pages: 0 });
  });

  test('filters and paginates digital object audit logs', async () => {
    DigitalCollectionModel.findAuditEvents.mockResolvedValue({ events: [], total: 31 });
    const req = { query: { event_type: 'download', search: 'annual', page: '2', limit: '20' } };
    const res = makeResponse();

    await DigitalCollectionController.getAuditLogs(req, res, jest.fn());

    expect(DigitalCollectionModel.findAuditEvents).toHaveBeenCalledWith({
      eventType: 'download', search: 'annual', limit: 20, offset: 20,
    });
    expect(res.body.data.pagination).toEqual({ page: 2, limit: 20, total: 31, pages: 2 });
  });

  test('does not track or deliver a private object from the public file endpoint', async () => {
    DigitalCollectionModel.findObjectById.mockResolvedValue(null);
    const res = makeResponse();

    await DigitalCollectionController.getPublicFile({ params: { objectId: '17' } }, res, jest.fn());

    expect(res.statusCode).toBe(404);
    expect(DigitalCollectionModel.recordEvent).not.toHaveBeenCalled();
    expect(res.body.success).toBe(false);
  });

  test('rejects an upload whose bytes do not match its declared MIME type', async () => {
    const { directory, filePath } = tempFile(Buffer.from('not a PDF'));
    DigitalCollectionModel.findCollectionById.mockResolvedValue({ collection_id: 3 });
    const req = {
      params: { collectionId: '3' },
      body: {
        rights_confirmed: 'true',
        metadata: JSON.stringify([{
          title: 'Annual report', material_type: 'Report', rights_status: 'Public Domain',
          rights_assessment_notes: 'Reviewed', is_public: false,
        }]),
      },
      files: [{ path: filePath, filename: 'upload.pdf', originalname: 'annual.pdf', mimetype: 'application/pdf', size: 10 }],
    };
    const res = makeResponse();

    await DigitalCollectionController.uploadObjects(req, res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(DigitalCollectionModel.createObjects).not.toHaveBeenCalled();
    expect(fs.existsSync(filePath)).toBe(false);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  test('persists valid batch uploads with the authenticated reviewer identity', async () => {
    const { directory, filePath } = tempFile(Buffer.from('%PDF-1.7\nvalid test payload'));
    DigitalCollectionModel.findCollectionById.mockResolvedValue({ collection_id: 3 });
    DigitalCollectionModel.createObjects.mockResolvedValue();
    const req = {
      params: { collectionId: '3' },
      user: { user_id: 12 },
      body: {
        rights_confirmed: 'true',
        metadata: JSON.stringify([{
          title: 'Annual report', material_type: 'Report', rights_status: 'Copyrighted - Permitted',
          rights_assessment_notes: 'Written permission on file', rights_evidence_reference: 'PERM-12',
          rights_expires_at: '', is_public: true,
        }]),
      },
      files: [{ path: filePath, filename: 'upload.pdf', originalname: 'annual.pdf', mimetype: 'application/pdf', size: 28 }],
    };
    const res = makeResponse();

    await DigitalCollectionController.uploadObjects(req, res, jest.fn());

    expect(DigitalCollectionModel.createObjects).toHaveBeenCalledWith('3', [expect.objectContaining({
      title: 'Annual report', rights_evidence_reference: 'PERM-12', file_path: 'upload.pdf',
    })], 12);
    expect(res.statusCode).toBe(201);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  test.each([
    ['MP4 video', Buffer.from([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]), 'video/mp4', 'clip.mp4'],
    ['WebM video', Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x93]), 'video/webm', 'clip.webm'],
    ['MP3 audio', Buffer.from('ID3\u0004\u0000\u0000\u0000\u0000\u0000\u0000'), 'audio/mpeg', 'audio.mp3'],
    ['DOCX document', Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'document.docx'],
  ])('accepts a valid %s signature', async (label, signature, mimetype, originalname) => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-digital-object-'));
    const filePath = path.join(directory, originalname);
    fs.writeFileSync(filePath, signature);
    DigitalCollectionModel.findCollectionById.mockResolvedValue({ collection_id: 3 });
    DigitalCollectionModel.createObjects.mockResolvedValue();
    const req = {
      params: { collectionId: '3' },
      user: { user_id: 12 },
      body: {
        rights_confirmed: 'true',
        metadata: JSON.stringify([{
          title: 'Archive video', material_type: 'Report', rights_status: 'Public Domain',
          rights_assessment_notes: 'Reviewed', is_public: false,
        }]),
      },
      files: [{ path: filePath, filename: originalname, originalname, mimetype, size: signature.length }],
    };
    const res = makeResponse();

    await DigitalCollectionController.uploadObjects(req, res, jest.fn());

    expect(res.statusCode).toBe(201);
    expect(DigitalCollectionModel.createObjects).toHaveBeenCalledWith('3', [expect.objectContaining({
      mime_type: mimetype, original_filename: originalname,
    })], 12);
    fs.rmSync(directory, { recursive: true, force: true });
  });

  test('blocks public access updates for unassessed or restricted objects', async () => {
    DigitalCollectionModel.findObjectById.mockResolvedValue({
      object_id: 22, rights_assessed: false, rights_status: 'Sensitive - Restricted',
    });
    const req = { params: { objectId: '22' }, body: { is_public: true }, user: { user_id: 12 } };
    const res = makeResponse();

    await DigitalCollectionController.updateObject(req, res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(DigitalCollectionModel.updateObject).not.toHaveBeenCalled();
  });
});