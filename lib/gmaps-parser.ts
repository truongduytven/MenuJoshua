/**
 * Helper to parse information from various Google Maps URL formats
 */
export function parseGoogleMapsUrl(url: string): {
  name?: string;
  address?: string;
  cleanUrl: string;
} {
  const trimmed = url.trim();
  if (!trimmed) {
    return { cleanUrl: '' };
  }

  let name: string | undefined;
  let address: string | undefined;

  try {
    const urlObj = new URL(trimmed);

    // Format 1: https://www.google.com/maps/place/Pho+Thin+13+Lo+Duc/@21.018,...
    if (urlObj.pathname.includes('/place/')) {
      const placePart = urlObj.pathname.split('/place/')[1];
      if (placePart) {
        const rawPlace = placePart.split('/')[0];
        const decoded = decodeURIComponent(rawPlace.replace(/\+/g, ' '));
        
        // Often contains "Name, Address"
        if (decoded.includes(',')) {
          const parts = decoded.split(',');
          name = parts[0].trim();
          address = parts.slice(1).join(',').trim();
        } else {
          name = decoded.trim();
        }
      }
    }

    // Format 2: https://www.google.com/maps/search/Bun+Cha+Huong+Lien...
    else if (urlObj.pathname.includes('/search/')) {
      const searchPart = urlObj.pathname.split('/search/')[1];
      if (searchPart) {
        const rawSearch = searchPart.split('/')[0];
        name = decodeURIComponent(rawSearch.replace(/\+/g, ' ')).trim();
      }
    }

    // Format 3: Query parameters like ?q=Pho+Thin
    else if (urlObj.searchParams.has('q')) {
      const q = urlObj.searchParams.get('q');
      if (q) {
        const decoded = decodeURIComponent(q.replace(/\+/g, ' '));
        if (decoded.includes(',')) {
          const parts = decoded.split(',');
          name = parts[0].trim();
          address = parts.slice(1).join(',').trim();
        } else {
          name = decoded.trim();
        }
      }
    }
  } catch {
    // If not a valid URL yet, do regex checks on plain text
    const placeMatch = trimmed.match(/\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
  }

  return {
    name: name || undefined,
    address: address || undefined,
    cleanUrl: trimmed,
  };
}
