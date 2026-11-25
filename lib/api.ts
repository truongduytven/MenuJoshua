import { Restaurant } from '@/types/restaurant';

export async function fetchRestaurantsApi(): Promise<Restaurant[]> {
  const res = await fetch('/api/restaurants', { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch restaurants');
  return json.data;
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

function estimateBase64Bytes(dataUri: string): number {
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return 0;
  const base64Body = dataUri.slice(commaIdx + 1).replace(/\s+/g, '');
  const padding = base64Body.endsWith('==') ? 2 : base64Body.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64Body.length * 3) / 4) - padding);
}

/**
 * Upload an image File/Blob or base64 data URI directly to Cloudinary using a server-signed payload.
 * Bypassing the Next.js API body avoids Vercel's 4.5MB serverless payload limit and supports up to 10MB.
 */
export async function uploadImageApi(image: File | Blob | string, publicId?: string): Promise<string> {
  const byteSize = typeof image === 'string' ? estimateBase64Bytes(image) : image.size;
  if (byteSize > MAX_IMAGE_BYTES) {
    const sizeMb = (byteSize / (1024 * 1024)).toFixed(2);
    throw new Error(`Dung lượng ảnh (${sizeMb} MB) vượt quá giới hạn tối đa 10MB.`);
  }

  const sigRes = await fetch('/api/upload/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });
  const sigJson = await sigRes.json();
  if (!sigRes.ok || !sigJson.success || !sigJson.data?.signature) {
    throw new Error(sigJson.error || 'Không thể lấy chữ ký upload ảnh');
  }

  const sig = sigJson.data as {
    cloudName: string;
    apiKey: string;
    timestamp: string;
    folder: string;
    signature: string;
    publicId?: string;
    overwrite?: string;
  };

  const form = new FormData();
  form.append('file', image);
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

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const uploadJson = await uploadRes.json();
  if (!uploadRes.ok || !uploadJson?.secure_url) {
    throw new Error(
      uploadJson?.error?.message || `Upload ảnh lên Cloudinary thất bại (${uploadRes.status})`
    );
  }

  return uploadJson.secure_url as string;
}

export async function saveRestaurantApi(restaurant: Restaurant): Promise<Restaurant> {
  const res = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(restaurant),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to save restaurant');
  return json.data;
}

export async function updateRestaurantApi(
  id: string,
  updates: Partial<Restaurant>
): Promise<Restaurant> {
  const res = await fetch(`/api/restaurants/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update restaurant');
  return json.data;
}

export async function deleteRestaurantApi(id: string): Promise<void> {
  const res = await fetch(`/api/restaurants/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete restaurant');
}

export async function bulkUpdateRestaurantsApi(
  items: Restaurant[],
  mode: 'replace' | 'append'
): Promise<Restaurant[]> {
  const res = await fetch('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, items }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to bulk update restaurants');
  return json.data;
}

export async function bulkDeleteRestaurantsApi(ids: string[]): Promise<void> {
  const res = await fetch('/api/restaurants', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete restaurants');
}

export async function clearAllRestaurantsApi(): Promise<void> {
  const res = await fetch('/api/restaurants', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ all: true }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to clear all restaurants');
}
