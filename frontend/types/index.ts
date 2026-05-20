export type OrderStatus = "Pending" | "Paid" | "Shipping" | "Delivered" | "Cancelled" | "Expired";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  minPrice?: number;
  availableStock?: number;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  specName: string;
  price: number;
  availableStock: number;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  category: string;
  variants: Array<{
    sku: string;
    specName: string;
    price: number;
    totalStock: number;
  }>;
}

export interface UpdateInventoryPayload {
  variantId: string;
  totalStock: number;
  availableStock: number;
}

export interface CartItem {
  cartItemId: string;
  variantId: string;
  productId: string;
  productName: string;
  specName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  availableStock: number;
  subtotal: number;
  isAvailable: boolean;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  finalAmount: number;
  createdAt: string;
  expiredAt: string;
}
