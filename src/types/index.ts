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
  size?: string;
  sheets?: number;
  gsm?: number;
  paperType?: string;
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

/** Cart context actions */
export type CartAction =
  | { type: 'ADD_ITEM'; product: Product; qty: number }
  | { type: 'REMOVE_ITEM'; sku: string }
  | { type: 'UPDATE_QTY'; sku: string; qty: number }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; items: CartItem[] };
