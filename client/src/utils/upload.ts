/**
 * Shared Upload Constants and Validation Utilities
 */

// Maximum image size: 5 MB
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image MIME types
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

// Allowed image extensions for file inputs
export const ALLOWED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp';

/**
 * Validates an image file for acceptable MIME type and size.
 * Returns an error string if invalid, or null if valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
    return 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.';
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return 'Image size exceeds the 5MB limit. Please choose a smaller image.';
  }

  return null;
}
