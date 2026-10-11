const fs = require('fs');
const os = require('os');
const path = require('path');

const uploadRoot = process.env.VERCEL
  ? path.join(os.tmpdir(), 'lms-uploads')
  : path.join(__dirname, '../../uploads');

function getUploadDirectory(name) {
  const directory = path.join(uploadRoot, name);
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

module.exports = { getUploadDirectory };
