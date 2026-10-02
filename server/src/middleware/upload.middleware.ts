import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// 5 MB maximum allowed file size
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// In-memory buffer storage
const storage = multer.memoryStorage();

const multerInstance = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type "${file.mimetype}". Only JPEG, PNG, and WebP images are allowed.`
        )
      );
    }
  },
});

/**
 * Validate magic bytes in the file buffer to prevent extension spoofing
 * (e.g. PDF, SVG, or EXE renamed to .jpg).
 */
export function isValidImageBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) return true;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  if (isPng) return true;

  // WebP: RIFF ... WEBP
  const isWebP =
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isWebP) return true;

  return false;
}

/**
 * General single-image uploader middleware factory for any field name.
 */
export function createSingleImageUploader(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    multerInstance.single(fieldName)(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
              status: 'error',
              message: 'Image size exceeds the 5MB limit. Please upload a smaller image.',
            });
            return;
          }
          res.status(400).json({
            status: 'error',
            message: `Upload error: ${err.message}`,
          });
          return;
        }

        res.status(400).json({
          status: 'error',
          message: err.message || 'Invalid image upload',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          status: 'error',
          message: `No image file uploaded. Please provide an image in the "${fieldName}" field.`,
        });
        return;
      }

      // Deep validation of magic bytes
      if (!isValidImageBuffer(req.file.buffer)) {
        res.status(400).json({
          status: 'error',
          message:
            'Invalid file content. The file is not a valid JPEG, PNG, or WebP image.',
        });
        return;
      }

      next();
    });
  };
}

/**
 * Middleware for single image upload on the "image" field (Student profile photo).
 */
export const uploadProfilePicture = createSingleImageUploader('image');

/**
 * Middleware for single image upload on the "logo" field (Company logo).
 */
export const uploadCompanyLogo = createSingleImageUploader('logo');
