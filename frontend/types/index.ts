export type OrderStatus = "Pending" | "Paid" | "Shipping" | "Delivered" | "Cancelled" | "Expired";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string | null;
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
  imageUrl?: string | null;
  variants: Array<{
    sku: string;
    specName: string;
    price: number;
    totalStock: number;
  }>;
}

export interface UpdateProductPayload {
  name: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  status: string;
  variants: Array<{
    id?: string;
    sku: string;
    specName: string;
    price: number;
    status?: string;
    totalStock?: number;
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
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
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
  shipment?: Shipment | null;
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

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNo: string | null;
  status: "Pending" | "Shipped" | "Delivered" | string;
  shippedAt: string | null;
  deliveredAt: string | null;
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
  status: "Draft" | "Published" | "Archived" | string;
  body: string | null;
  slug: string | null;
  category: string | null;
  videoUrl: string | null;
  summary: string | null;
  viewCount: number;
  position: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  publishedAt: string | null;
  version: number;
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
  body?: string | null;
  slug?: string | null;
  category?: string | null;
  videoUrl?: string | null;
  summary?: string | null;
  isActive: boolean;
  startAt?: string | null;
  endAt?: string | null;
  changeNote?: string | null;
}

export interface ContentVersion {
  id: string;
  versionNumber: number;
  title: string;
  subtitle: string | null;
  body: string | null;
  category: string | null;
  videoUrl: string | null;
  summary: string | null;
  imageUrl: string;
  placement: string;
  modifiedByName: string;
  changeNote: string;
  createdAt: string;
}

export interface ContentFeedItem {
  id: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  category: string | null;
  slug: string | null;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
}

export interface ContentDetail extends ContentFeedItem {
  body: string | null;
  media: ContentBlockMedia[];
  relatedContents: ContentFeedItem[];
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

export interface MediaFileUsage {
  id: string;
  entityType: string;
  entityId: string;
  fieldName: string;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  fileName: string;
  filePath: string;
  thumbnailPath: string | null;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string | null;
  uploadedByName: string;
  createdAt: string;
  usageCount: number;
  usages?: MediaFileUsage[];
}

export interface MediaList {
  items: MediaFile[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  communityPosts: number;
  communityLikes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
  stats: UserStats | null;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  communityPosts: number;
  communityLikes: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  category: string;
  title: string;
  content: string;
  imageUrl: string | null;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLikedByMe: boolean;
  createdAt: string;
}

export interface CommunityPostDetail extends CommunityPost {
  authorId: string;
  comments: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
  authorId: string;
  content: string;
  likeCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  parentCommentId: string | null;
  replies: CommunityComment[];
}

export interface AdminCommunityPost {
  id: string;
  title: string;
  authorName: string;
  category: string;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isHidden: boolean;
  createdAt: string;
}
