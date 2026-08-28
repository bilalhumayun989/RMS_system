export interface MenuItem {
  id: number;
  name: string;
  category?: MenuCategory;
  price: number;
  emoji: string;
  prepTime: string;
  popular: boolean;
  description?: string;
  image?: string;
  discount?: number;
}

export type MenuCategory = string; // Flexible — predefined: Breakfast, Fastfood, Seafood, Desserts — custom allowed

