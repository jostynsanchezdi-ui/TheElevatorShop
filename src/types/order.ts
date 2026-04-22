export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  zohoItemId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress?: Record<string, string>;
  zohoSalesOrderId?: string;
  createdAt: string;
  updatedAt: string;
}
