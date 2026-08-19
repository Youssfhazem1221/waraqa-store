// ============================================================
// Waraqa Store — TypeScript Types
// ============================================================

/** Product as returned from the Google Sheet / products.json */
export interface Product {
  sku: string;
  name: string;
  nameAr: string;
  category: string;
  size: string;
  sheets: number;
  gsm: number;
  paperType: string;
  price: number;
  compareAt: number;
  stock: number;
  status: 'Active' | 'Out of stock' | 'Hidden';
  image: string;
  images: string[];
  description: string;
  featured: boolean;
  slug: string;
}

/** Product shape from Apps Script (needs mapping to our Product type) */
export interface ApiProduct {
  sku: string;
  name: string;
  nameAr: string;
  category: string;
  price: number;
  compareAt: number;
  stock: number;
  status: string;
  image: string;
  description: string;
  featured: boolean;
}

/** Cart item = product + quantity */
export interface CartItem {
  product: Product;
  qty: number;
}

/** Customer info collected at checkout */
export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  address: string;
}

/** Individual order item for the API payload */
export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

/** Full order payload sent to Apps Script */
export interface OrderPayload {
  action: 'createOrder';
  customer: CustomerInfo;
  items: OrderItem[];
  shipping: number;
  payment: string;
  notes: string;
}

/** Response from createOrder */
export interface OrderResponse {
  ok: boolean;
  orderId?: string;
  total?: number;
  subtotal?: number;
  shipping?: number;
  error?: string;
}

/** Admin: stock update payload */
export interface StockUpdatePayload {
  action: 'updateStock';
  token: string;
  sku: string;
  stock: number;
  status: string;
}

/** Admin: order status update payload */
export interface OrderStatusUpdatePayload {
  action: 'updateOrderStatus';
  token: string;
  orderId: string;
  status: string;
}

/** Order as returned from admin GET */
export interface Order {
  'Order ID': string;
  'Timestamp': string;
  'Customer name': string;
  'Phone (WhatsApp)': string;
  'Email': string;
  'Governorate/City': string;
  'Address': string;
  'Items summary': string;
  'Total qty': number;
  'Subtotal (EGP)': number;
  'Shipping (EGP)': number;
  'Total (EGP)': number;
  'Payment': string;
  'Status': string;
  'WhatsApp sent?': string;
  'Notes': string;
}

/** Cart context actions */
export type CartAction =
  | { type: 'ADD_ITEM'; product: Product; qty: number }
  | { type: 'REMOVE_ITEM'; sku: string }
  | { type: 'UPDATE_QTY'; sku: string; qty: number }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; items: CartItem[] };

/** Order statuses for admin */
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Product statuses for admin */
export const PRODUCT_STATUSES = ['Active', 'Out of stock', 'Hidden'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
