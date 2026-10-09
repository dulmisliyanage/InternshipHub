import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Storage directory for private student CVs.
 * Located completely outside any public/statically served folders.
 */
const DEFAULT_STORAGE_DIR = path.resolve(__dirname, '../../storage/private_cvs');
const CV_STORAGE_DIR = process.env.CV_STORAGE_DIR || DEFAULT_STORAGE_DIR;

// Ensure storage directory exists
if (!fs.existsSync(CV_STORAGE_DIR)) {
  fs.mkdirSync(CV_STORAGE_DIR, { recursive: true });
}

export interface CvSaveResult {
  storageKey: string;
}

/**
 * Saves a validated PDF CV buffer to private server storage.
 * Generates an unpredictable random cryptographic key to prevent enumeration.
 */
export async function saveCvFile(
  buffer: Buffer,
  _originalFilename: string
): Promise<CvSaveResult> {
  // Generate random cryptographic storage key
  const randomSuffix = crypto.randomUUID();
  const storageKey = `cv_${randomSuffix}.pdf`;
  const filePath = path.join(CV_STORAGE_DIR, storageKey);

  await fs.promises.writeFile(filePath, buffer);

  return { storageKey };
}

/**
 * Deletes a stored CV file.
 * Used for cleanup when application creation or database transactions fail.
 */
export async function deleteCvFile(storageKey: string): Promise<void> {
  if (!storageKey || typeof storageKey !== 'string') return;

  // Prevent directory traversal
  const safeFilename = path.basename(storageKey);
  const filePath = path.join(CV_STORAGE_DIR, safeFilename);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.warn(`Failed to delete CV file (${safeFilename}):`, err);
  }
}

/**
 * Resolves the absolute path for an authorized private CV file.
 * Returns null if the file does not exist or key contains path traversal.
 */
export function getCvFilePath(storageKey: string): string | null {
  if (!storageKey || typeof storageKey !== 'string') return null;

  const safeFilename = path.basename(storageKey);
  const filePath = path.join(CV_STORAGE_DIR, safeFilename);

  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}
