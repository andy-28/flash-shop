import { apiClient } from "@/lib/api/client";
import type { ApplyCouponResult, Coupon, CouponPayload } from "@/types";

export async function validateCoupon(code: string, orderAmount: number) {
  const response = await apiClient.post<ApplyCouponResult>("/coupons/validate", { code, orderAmount });
  return response.data;
}

export async function getAdminCoupons() {
  const response = await apiClient.get<Coupon[]>("/admin/coupons");
  return response.data;
}

export async function createCoupon(payload: CouponPayload) {
  const response = await apiClient.post<Coupon>("/admin/coupons", payload);
  return response.data;
}

export async function updateCoupon(id: string, payload: Omit<CouponPayload, "code" | "discountType">) {
  const response = await apiClient.put<Coupon>(`/admin/coupons/${id}`, payload);
  return response.data;
}

export async function deleteCoupon(id: string) {
  await apiClient.delete(`/admin/coupons/${id}`);
}
