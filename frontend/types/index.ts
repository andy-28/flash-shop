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
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  createdAt: string;
  paidAt: string | null;
  expiredAt: string;
  itemCount: number;
  userName?: string | null;
  userEmail?: string | null;
  items: OrderItem[];
  payment?: Payment | null;
}

export interface OrderItem {
  productName: string;
  specName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  method: string;
  status: "Pending" | "Success" | "Failed" | "Refunded";
  paidAt: string | null;
  transactionId: string | null;
}

export interface ContentBlockMedia {
  id: string;
  mediaType: string;
  mediaUrl: string;
  position: number;
}

export interface ContentBlock {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkType: "Internal" | "External" | "Product" | "None" | string;
  placement: string;
  position: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  media: ContentBlockMedia[];
}

export interface ContentBlockPayload {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  linkType: string;
  placement: string;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
}
