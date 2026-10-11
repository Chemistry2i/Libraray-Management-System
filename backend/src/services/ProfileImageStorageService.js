const { randomUUID } = require('crypto');
const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

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

class ProfileImageStorageService {
  static shouldRemoveTemporaryFile() {
    return hasCloudinaryConfig || config.NODE_ENV === 'production';
  }

  static async store(file) {
    if (!hasCloudinaryConfig) {
      if (config.NODE_ENV === 'production') {
        throw new Error('Persistent profile image storage is not configured. Set Cloudinary credentials.');
      }
      return `${config.API_URL}/uploads/profile-images/${file.filename}`;
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'kamuli-cu-library/profile-images',
      public_id: randomUUID(),
      resource_type: 'image',
      overwrite: false,
      use_filename: false,
      unique_filename: false,
    });
    return result.secure_url;
  }
}

module.exports = ProfileImageStorageService;
