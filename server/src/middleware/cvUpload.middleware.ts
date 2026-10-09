import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// 5 MB maximum allowed file size
const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['application/pdf'];

// In-memory buffer storage for inspection before secure persisting
const storage = multer.memoryStorage();

const cvMulterInstance = multer({
  storage,
  limits: {
    fileSize: MAX_CV_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type "${file.mimetype}". Only PDF documents are allowed.`
        )
      );
    }
  },
});

/**
 * Validate PDF signature in file buffer (magic bytes: %PDF- / 0x25 0x50 0x44 0x46 0x2D)
 * to prevent extension or MIME spoofing (e.g. an EXE, HTML, or JPEG renamed to .pdf).
 */
export function isValidPdfBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 5) return false;
  // %PDF-
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

/**
 * Express middleware for single CV upload.
 * Validates file size, MIME type, and PDF signature.
 */
export function uploadCvMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const upload = cvMulterInstance.single('cv');

  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          status: 'error',
          message: 'File size exceeds the 5 MB limit. Please upload a smaller PDF document.',
        });
        return;
      }
      res.status(400).json({
        status: 'error',
        message: `Upload error: ${err.message}`,
      });
      return;
    } else if (err) {
      res.status(400).json({
        status: 'error',
        message: err.message || 'File upload failed. Only PDF documents are allowed.',
      });
      return;
    }

    // Verify file presence
    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'A CV document in PDF format is required.',
      });
      return;
    }

    // Server-side PDF signature validation
    if (!isValidPdfBuffer(req.file.buffer)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid PDF document. The file content does not match a valid PDF signature.',
      });
      return;
    }

    next();
  });
}
