const fs = require('fs');
const https = require('https');
const path = require('path');
const { randomUUID } = require('crypto');
const cloudinary = require('cloudinary').v2;
const { getUploadDirectory } = require('../utils/uploadDirectories');

const uploadDirectory = getUploadDirectory('digital-objects');
const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_URL
  || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

if (hasCloudinaryConfig && !process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (hasCloudinaryConfig) {
  cloudinary.config({ secure: true });
}

class DigitalCollectionStorageService {
  static isCloudinaryEnabled() {
    return hasCloudinaryConfig;
  }

  static async store(file) {
    if (!hasCloudinaryConfig) {
      return {
        file_path: path.basename(file.filename),
        storage_provider: 'local',
        cloudinary_resource_type: null,
        cloudinary_version: null,
        cloudinary_format: null,
      };
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'kamuli-cu-library/digital-collections',
      public_id: randomUUID(),
      resource_type: 'auto',
      type: 'authenticated',
      access_mode: 'authenticated',
      overwrite: false,
      use_filename: false,
      unique_filename: false,
    });
    return {
      file_path: result.public_id,
      storage_provider: 'cloudinary',
      cloudinary_resource_type: result.resource_type,
      cloudinary_version: result.version,
      cloudinary_format: result.format,
    };
  }

  static async storeBookCover(file) {
    if (!hasCloudinaryConfig) {
      return {
        url: `/uploads/books/${path.basename(file.filename)}`,
        provider: 'local',
        publicId: null,
      };
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'kamuli-cu-library/book-covers',
      public_id: randomUUID(),
      resource_type: 'image',
      overwrite: false,
      use_filename: false,
      unique_filename: false,
    });
    return {
      url: result.secure_url,
      provider: 'cloudinary',
      publicId: result.public_id,
    };
  }

  static async deleteBookCover(publicId) {
    if (!publicId || !hasCloudinaryConfig) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
  }

  static localPath(object) {
    return path.join(uploadDirectory, path.basename(object.file_path));
  }

  static async streamCloudinaryObject(res, object) {
    const url = cloudinary.url(object.file_path, {
      secure: true,
      sign_url: true,
      resource_type: object.cloudinary_resource_type,
      version: object.cloudinary_version,
      format: object.cloudinary_format,
      type: 'authenticated',
    });

    return new Promise((resolve, reject) => {
      let redirectCount = 0;
      const requestFile = (target) => {
        const upstream = https.get(target, (response) => {
          if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
            response.resume();
            if (redirectCount >= 5) {
              reject(new Error('Cloudinary delivery exceeded the redirect limit'));
              return;
            }
            const redirectedUrl = new URL(response.headers.location, target);
            if (redirectedUrl.protocol !== 'https:'
              || !(redirectedUrl.hostname === 'cloudinary.com' || redirectedUrl.hostname.endsWith('.cloudinary.com'))) {
              reject(new Error('Cloudinary returned an invalid delivery redirect'));
              return;
            }
            redirectCount += 1;
            requestFile(redirectedUrl);
            return;
          }
          if (response.statusCode !== 200) {
            response.resume();
            reject(new Error(`Cloudinary delivery failed with status ${response.statusCode}`));
            return;
          }
          response.pipe(res);
          response.on('end', resolve);
          response.on('error', reject);
        });
        upstream.setTimeout(30000, () => upstream.destroy(new Error('Cloudinary delivery timed out')));
        upstream.on('error', reject);
      };
      requestFile(url);
    });
  }

  static async delete(object) {
    if (object.storage_provider === 'cloudinary') {
      await cloudinary.uploader.destroy(object.file_path, {
        resource_type: object.cloudinary_resource_type || 'image',
        type: 'authenticated',
        invalidate: true,
      });
      return;
    }
    await fs.promises.rm(this.localPath(object), { force: true });
  }
}

module.exports = DigitalCollectionStorageService;