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
  variantId: string;
  productName: string;
  specName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  finalAmount: number;
  createdAt: string;
  expiredAt: string;
}
