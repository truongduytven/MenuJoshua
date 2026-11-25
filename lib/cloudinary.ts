import crypto from 'node:crypto';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const BASE64_IMAGE_REGEX = /^data:image\/[a-zA-Z0-9+.-]+;base64,/i;
const DEFAULT_CLOUDINARY_FOLDER = 'menu_joshua';

export interface CloudinarySignaturePayload {
  cloudName: string;
  apiKey: string;
  timestamp: string;
  folder: string;
  signature: string;
  publicId?: string;
  overwrite?: string;
}

/**
 * Return true when the provided image string is a base64 data URI.
 */
export function isBase64Image(value?: string | null): value is string {
  return typeof value === 'string' && BASE64_IMAGE_REGEX.test(value.trim());
}

/**
 * Compute decoded byte length of a base64 data URI.
 */
export function getBase64DecodedBytes(dataUri: string): number {
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return 0;
  const base64Body = dataUri.slice(commaIdx + 1).replace(/\s+/g, '');
  const padding = base64Body.endsWith('==') ? 2 : base64Body.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64Body.length * 3) / 4) - padding);
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_FOLDER?.trim() || DEFAULT_CLOUDINARY_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Thiếu cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).'
    );
  }

  return { cloudName, apiKey, apiSecret, folder };
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string): string {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(`${serialized}${apiSecret}`)
    .digest('hex');
}

/**
 * Create a short-lived signed upload payload for direct browser-to-Cloudinary uploads.
 */
export function createCloudinaryUploadSignature(publicId?: string): CloudinarySignaturePayload {
  const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signedParams: Record<string, string> = {
    folder,
    timestamp,
  };

  const sanitizedId = publicId?.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  if (sanitizedId) {
    signedParams.public_id = sanitizedId;
    signedParams.overwrite = 'true';
  }

  const signature = signCloudinaryParams(signedParams, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    ...(sanitizedId ? { publicId: sanitizedId, overwrite: 'true' } : {}),
  };
}

/**
 * Upload a base64 image data URI to Cloudinary and return its HTTPS secure_url.
 */
export async function uploadBase64ToCloudinary(
  dataUri: string,
  publicId?: string
): Promise<string> {
  const trimmed = dataUri.trim();
  if (!isBase64Image(trimmed)) {
    throw new Error('Chuỗi ảnh không đúng định dạng base64 data URI.');
  }

  const decodedBytes = getBase64DecodedBytes(trimmed);
  if (decodedBytes > MAX_IMAGE_BYTES) {
    const sizeMb = (decodedBytes / (1024 * 1024)).toFixed(2);
    throw new Error(`Dung lượng ảnh (${sizeMb} MB) vượt quá giới hạn tối đa 10MB.`);
  }

  const sig = createCloudinaryUploadSignature(publicId);

  const form = new FormData();
  form.append('file', trimmed);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', sig.timestamp);
  form.append('folder', sig.folder);
  if (sig.publicId) {
    form.append('public_id', sig.publicId);
  }
  if (sig.overwrite) {
    form.append('overwrite', sig.overwrite);
  }
  form.append('signature', sig.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const result = await res.json();
  if (!res.ok || !result?.secure_url) {
    throw new Error(
      `Upload ảnh lên Cloudinary thất bại (${res.status}): ${result?.error?.message || 'Lỗi không xác định'}`
    );
  }

  return result.secure_url as string;
}

/**
 * Resolve an incoming imageUrl: upload base64 data URIs to Cloudinary and return the URL,
 * or return the trimmed URL string as-is.
 */
export async function resolveRestaurantImageUrl(
  imageUrl?: string | null,
  publicId?: string
): Promise<string> {
  const trimmed = (imageUrl || '').trim();
  if (!trimmed) return '';
  if (isBase64Image(trimmed)) {
    return uploadBase64ToCloudinary(trimmed, publicId);
  }
  return trimmed;
}
