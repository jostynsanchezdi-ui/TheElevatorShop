export interface CartItem {
  zohoItemId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
}
