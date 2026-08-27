export type Restaurant = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  eaten: boolean;
  eatenAt?: string;
  createdAt: string;
  note?: string;
  isFavorite?: boolean;
};


export type ThemePreset =
  | 'orange-food'
  | 'strawberry'
  | 'fresh-lime'
  | 'ocean-food'
  | 'grape-dessert'
  | 'dark-warm';

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
};


