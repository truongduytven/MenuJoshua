import { Restaurant, ThemePreset } from '@/types/restaurant';

const RESTAURANTS_KEY = 'an_gi_hom_nay_restaurants_v1';
const THEME_KEY = 'an_gi_hom_nay_theme_v1';
const SOUND_KEY = 'an_gi_hom_nay_sound_v1';
const CUSTOM_COLORS_KEY = 'an_gi_hom_nay_custom_colors_v1';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'res-1',
    name: 'Phở Thìn Lò Đúc',
    address: '13 Lò Đúc, Quận Hai Bà Trưng, Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-25T19:30:00.000Z',
    createdAt: '2026-08-20T09:00:00.000Z',
    note: 'Phở bò tái lăn đậm vị, thơm nức mùi hành lá xào gừng',
    isFavorite: true,
  },
  {
    id: 'res-2',
    name: 'Pizza 4P\'s - Pizza Phô Mai Burrata',
    address: '8/15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-21T10:00:00.000Z',
    note: 'Pizza phô mai tươi 4P\'s cực đỉnh, mì cua sốt kem béo ngậy',
    isFavorite: true,
  },
  {
    id: 'res-3',
    name: 'Cơm Tấm Ba Ghiền',
    address: '84 Đặng Văn Ngữ, Phường 10, Phú Nhuận, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-21T11:30:00.000Z',
    note: 'Miếng sườn nướng to khổng lồ che kín đĩa cơm tấm',
  },
  {
    id: 'res-4',
    name: 'Bún Bò Huế Đinh Tiên Hoàng',
    address: '143 Đinh Tiên Hoàng, Đa Kao, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-22T12:00:00.000Z',
    createdAt: '2026-08-21T14:00:00.000Z',
    note: 'Nước dùng thơm sả ruốc đậm đà, chả cua và nạm bò mềm ngon',
  },
  {
    id: 'res-5',
    name: 'Sushi & Sashimi Hokkaido Sachi',
    address: '139 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-22T08:00:00.000Z',
    note: 'Cá hồi Na Uy, sò điệp và nhum biển tươi rói chuẩn Nhật',
    isFavorite: true,
  },
  {
    id: 'res-6',
    name: 'Lẩu Nấm Thiên Nhiên Ashima',
    address: '35A Nguyễn Đình Chiểu, Đa Kao, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-22T15:30:00.000Z',
    note: 'Nước lẩu thanh ngọt tự nhiên cùng hơn 20 loại nấm quý',
  },
  {
    id: 'res-7',
    name: 'Bánh Mì Huỳnh Hoa (Bánh Mì Ô Môi)',
    address: '26 Lê Thị Riêng, Phường Bến Thành, Quận 1, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-24T18:15:00.000Z',
    createdAt: '2026-08-23T09:10:00.000Z',
    note: 'Bánh mì ngập ngụa bơ pate, giò chả và chà bông giòn rụm',
    isFavorite: true,
  },
  {
    id: 'res-8',
    name: 'Nướng Hàn Quốc Meat & Meet BBQ',
    address: 'Tầng 4 Estella Place, 88 Song Hành, An Phú, TP. Thủ Đức',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-23T16:00:00.000Z',
    note: 'Thịt ba chỉ nướng cuốn lá mè, kim chi cay nồng chuẩn vị Seoul',
  },
  {
    id: 'res-9',
    name: 'Dimsum Tiến Phát - Điểm Tâm Hồng Kông',
    address: '18 Ký Hòa, Phường 11, Quận 5, TP.HCM',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1000&q=80',
    eaten: false,
    createdAt: '2026-08-24T07:45:00.000Z',
    note: 'Há cảo tôm thủy tinh giòn sần sật, bánh bao kim sa trứng muối chảy',
    isFavorite: true,
  },
  {
    id: 'res-10',
    name: 'Cà Phê Trứng & Trà Sữa Giảng',
    address: '39 Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
    eaten: true,
    eatenAt: '2026-08-26T10:00:00.000Z',
    createdAt: '2026-08-24T14:20:00.000Z',
    note: 'Lớp kem trứng đánh bông mịn ngậy trên nền cà phê phin đậm đà',
  },
];


export const FOOD_PRESET_IMAGES = [
  { name: 'Phở & Bún', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cơm Tấm / Đồ nướng', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pizza & Pasta', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bánh Mì kẹp', url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sushi & Sashimi', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lẩu / Nồi canh', url: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dimsum & Há cảo', url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Burger & Gà rán', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cà phê & Đồ uống', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tráng miệng / Bánh ngọt', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
];

export function getStoredRestaurants(): Restaurant[] {
  if (typeof window === 'undefined') return INITIAL_RESTAURANTS;
  try {
    const raw = localStorage.getItem(RESTAURANTS_KEY);
    if (!raw) {
      localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(INITIAL_RESTAURANTS));
      return INITIAL_RESTAURANTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESTAURANTS;
  }
}

export function saveStoredRestaurants(restaurants: Restaurant[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));
    window.dispatchEvent(new Event('restaurants_updated'));
  } catch (err) {
    console.error('Error saving restaurants', err);
  }
}

export function getStoredTheme(): ThemePreset {
  if (typeof window === 'undefined') return 'orange-food';
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return (raw as ThemePreset) || 'orange-food';
  } catch {
    return 'orange-food';
  }
}

export function saveStoredTheme(theme: ThemePreset) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch (err) {
    console.error('Error saving theme', err);
  }
}

export function getStoredSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw !== null ? raw === 'true' : true;
  } catch {
    return true;
  }
}

export function saveStoredSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_KEY, enabled.toString());
  } catch (err) {
    console.error('Error saving sound setting', err);
  }
}

export function getStoredCustomColors(): { primary?: string; secondary?: string; background?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CUSTOM_COLORS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredCustomColors(colors: { primary?: string; secondary?: string; background?: string } | null) {
  if (typeof window === 'undefined') return;
  try {
    if (colors) {
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(colors));
      if (colors.primary) {
        document.documentElement.style.setProperty('--color-primary', colors.primary);
      }
      if (colors.secondary) {
        document.documentElement.style.setProperty('--color-secondary', colors.secondary);
      }
      if (colors.background) {
        document.documentElement.style.setProperty('--color-background', colors.background);
      }
    } else {
      localStorage.removeItem(CUSTOM_COLORS_KEY);
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-background');
    }
  } catch (err) {
    console.error('Error saving custom colors', err);
  }
}

export function exportData(): string {
  const data = {
    restaurants: getStoredRestaurants(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed.restaurants)) {
      saveStoredRestaurants(parsed.restaurants);
    }
    return true;
  } catch {
    return false;
  }
}

export function resetAllDataToSample() {
  saveStoredRestaurants(INITIAL_RESTAURANTS);
  saveStoredTheme('orange-food');
  saveStoredCustomColors(null);
}

