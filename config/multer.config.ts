import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate a 7-character random string using crypto (more unique than Math.random)
const shortId = () => crypto.randomBytes(4).toString('hex').substring(0, 7);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, '_')        // replace spaces with underscores
      .replace(/[^\w\-]/g, '');    // remove unsafe characters

    const unique = shortId(); // e.g. "a3f9d2b"
    cb(null, `${unique}-${base}${ext}`);
  }
});

const upload = multer({ storage });
export default upload;
