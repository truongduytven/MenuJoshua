import { Restaurant } from '@/types/restaurant';

export async function fetchRestaurantsApi(): Promise<Restaurant[]> {
  const res = await fetch('/api/restaurants', { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch restaurants');
  return json.data;
}

export async function uploadImageApi(imageBase64: string, publicId?: string): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: imageBase64, publicId }),
  });
  const json = await res.json();
  if (!json.success || !json.data?.url) {
    throw new Error(json.error || 'Failed to upload image');
  }
  return json.data.url;
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
