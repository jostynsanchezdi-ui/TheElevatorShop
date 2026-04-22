export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  specifications: Record<string, string>;
  isActive: boolean;
}
