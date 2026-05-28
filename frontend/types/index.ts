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
  couponCode?: string | null;
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

export interface Coupon {
  id: string;
  code: string;
  discountType: "Fixed" | "Percentage" | string;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isExpired: boolean;
  isFullyUsed: boolean;
}

export interface CouponPayload {
  code: string;
  discountType: "Fixed" | "Percentage";
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  validFrom: string;
  validUntil: string;
}

export interface ApplyCouponResult {
  isValid: boolean;
  errorMessage: string | null;
  couponId: string | null;
  code: string | null;
  discountType: string | null;
  discountAmount: number;
}

export interface DashboardSummary {
  todayOrderCount: number;
  todayRevenue: number;
  todayNewUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
  dailyStats: DailyStat[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export interface DailyStat {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderNo: string;
  userName: string;
  userEmail: string;
  status: OrderStatus;
  finalAmount: number;
  createdAt: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export interface AuditLog {
  id: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string | null;
  createdAt: string;
}

export interface AuditLogList {
  items: AuditLog[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface FlashSale {
  id: string;
  variantId: string;
  productId?: string;
  productName: string;
  specName: string;
  title: string;
  originalPrice?: number;
  flashPrice: number;
  totalStock: number;
  remainingStock?: number;
  soldCount: number;
  perUserLimit: number;
  startAt: string;
  endAt: string;
  status: "Pending" | "Active" | "Ended" | "Cancelled" | string;
}

export interface FlashSalePayload {
  variantId: string;
  title: string;
  flashPrice: number;
  totalStock: number;
  perUserLimit: number;
  startAt: string;
  endAt: string;
}
