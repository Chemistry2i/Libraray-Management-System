const { EventEmitter } = require('events');
const https = require('https');
const { PassThrough, Writable } = require('stream');

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    url: jest.fn(),
    utils: { private_download_url: jest.fn() },
    uploader: { upload: jest.fn(), destroy: jest.fn() },
  },
}));

const cloudinary = require('cloudinary').v2;
const DigitalCollectionStorageService = require('../DigitalCollectionStorageService');

function responseWith(statusCode, body) {
  const response = new PassThrough();
  response.statusCode = statusCode;
  response.headers = {};
  process.nextTick(() => response.end(body));
  return response;
}

function writableResponse() {
  const chunks = [];
  const response = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });
  response.body = () => Buffer.concat(chunks).toString();
  return response;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DigitalCollectionStorageService Cloudinary delivery', () => {
  test('uses signed delivery first and falls back to authenticated download for raw files', async () => {
    cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/raw/authenticated/signed/file.pdf');
    cloudinary.utils.private_download_url.mockReturnValue('https://api.cloudinary.com/test/raw/download');
    const responses = [
      [401, '{"error":{"message":"signed delivery rejected"}}'],
      [200, 'PDF content'],
    ];
    jest.spyOn(https, 'get').mockImplementation((url, callback) => {
      const request = new EventEmitter();
      request.setTimeout = jest.fn();
      request.destroy = jest.fn();
      const [statusCode, body] = responses.shift();
      process.nextTick(() => callback(responseWith(statusCode, body)));
      return request;
    });
    const res = writableResponse();

    await DigitalCollectionStorageService.streamCloudinaryObject(res, {
      file_path: 'archive/annual-report.pdf',
      original_filename: 'annual-report.pdf',
      cloudinary_resource_type: 'raw',
      cloudinary_version: 123,
      cloudinary_format: 'pdf',
    }, true);

    expect(cloudinary.url).toHaveBeenCalledWith('archive/annual-report', expect.objectContaining({
      resource_type: 'raw',
      format: 'pdf',
      version: 123,
      type: 'authenticated',
      sign_url: true,
    }));
    expect(cloudinary.utils.private_download_url).toHaveBeenCalledWith('archive/annual-report', 'pdf', expect.objectContaining({
      resource_type: 'raw',
      type: 'authenticated',
      attachment: true,
    }));
    expect(res.body()).toBe('PDF content');
    https.get.mockRestore();
  });
});
