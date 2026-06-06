"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Loader2, ShoppingBag, Tag, X } from "lucide-react";
import { AxiosError } from "axios";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { validateCoupon } from "@/lib/api/coupons";
import { createOrder } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import type { ApplyCouponResult } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { clearCart, fetchCart, items, totalAmount } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<ApplyCouponResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    void fetchCart();
  }, [fetchCart, hasHydrated, isAuthenticated, router]);

  const appliedDiscount = couponResult?.isValid ? couponResult.discountAmount : 0;
  const finalAmount = Math.max(totalAmount - appliedDiscount, 0);

  const applyCoupon = async () => {
    if (isApplyingCoupon) return;

    const trimmedCode = couponCode.trim();
    if (!trimmedCode) {
      setCouponResult(null);
      setCouponError("Enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponResult(null);
    try {
      const result = await validateCoupon(trimmedCode, totalAmount);
      if (result.isValid) {
        setCouponResult(result);
        setCouponCode(result.code ?? trimmedCode);
        toast.success("優惠券已套用");
        return;
      }

      setCouponError(result.errorMessage ?? "Coupon is not valid.");
      toast.error(result.errorMessage ?? "優惠券不可用");
    } catch (exception) {
      const axiosError = exception as AxiosError<{ message?: string }>;
      setCouponError(axiosError.response?.data?.message ?? "Unable to validate coupon.");
      toast.error(axiosError.response?.data?.message ?? "優惠券驗證失敗");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
    setCouponError(null);
  };

  const submitOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const order = await createOrder(couponResult?.isValid ? couponResult.code ?? couponCode.trim() : undefined);
      clearCart();
      toast.success("訂單建立成功");
      router.push(`/orders/${order.id}`);
    } catch (exception) {
      const axiosError = exception as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to create order.");
      toast.error(axiosError.response?.data?.message ?? "訂單建立失敗，請重新確認。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <ShopNavbar />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <section>
          <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">Checkout</p>
          <h1 className="mt-3 text-4xl font-semibold">Confirm your order</h1>

          {items.length === 0 ? (
            <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-md border border-border-default bg-bg-secondary text-center">
              <ShoppingBag className="size-12 text-text-tertiary" />
              <p className="mt-4 font-medium">Your cart is empty.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <article key={item.cartItemId} className="grid gap-4 rounded-md border border-border-default bg-bg-secondary p-4 md:grid-cols-[1fr_110px_120px] md:items-center">
                  <div>
                    <h2 className="font-medium">{item.productName}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{item.specName}</p>
                    <p className="mt-2 text-sm text-text-secondary">NT$ {item.unitPrice.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <p className="text-sm text-text-secondary">Qty {item.quantity}</p>
                  <p className="font-semibold md:text-right">NT$ {item.subtotal.toLocaleString()}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-md border border-border-default bg-bg-secondary p-5 lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span>NT$ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span>Free</span>
            </div>
          </div>

          <div className="mt-5 rounded-md border border-border-default bg-bg-tertiary p-3">
            <label htmlFor="coupon-code" className="text-sm font-medium">
              Coupon
            </label>
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="coupon-code"
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value);
                    setCouponResult(null);
                    setCouponError(null);
                  }}
                  className={`h-10 w-full rounded-md border bg-bg-primary pl-9 pr-3 text-sm outline-none transition ${
                    couponResult?.isValid
                      ? "border-status-success"
                      : couponError
                        ? "border-status-danger"
                        : "border-border-default focus:border-border-hover"
                  }`}
                  placeholder="SAVE100"
                  disabled={Boolean(couponResult?.isValid)}
                />
              </div>
              {couponResult?.isValid ? (
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-md border border-border-default text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  onClick={removeCoupon}
                  aria-label="Remove coupon"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-accent-primary px-4 text-sm font-medium text-accent-primary-text disabled:opacity-40"
                  disabled={isApplyingCoupon || totalAmount <= 0}
                  onClick={applyCoupon}
                >
                  {isApplyingCoupon ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                  Apply
                </button>
              )}
            </div>
            {couponResult?.isValid ? (
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-status-success">
                <Check className="size-4" />
                {couponResult.code} applied. Discount NT$ {couponResult.discountAmount.toLocaleString()}.
              </p>
            ) : null}
            {couponError ? <p className="mt-2 text-sm text-status-danger">{couponError}</p> : null}
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Discount</span>
              <span className={appliedDiscount > 0 ? "text-status-success" : undefined}>
                {appliedDiscount > 0 ? "-" : ""}NT$ {appliedDiscount.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-border-default pt-5 text-lg font-semibold">
            <span>Total</span>
            <span>NT$ {finalAmount.toLocaleString()}</span>
          </div>
          {error ? <p className="mt-3 text-sm text-status-danger">{error}</p> : null}
          <LoadingButton
            className="mt-5"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            loadingText="訂單處理中..."
            disabled={items.length === 0}
            onClick={submitOrder}
          >
            送出訂單
          </LoadingButton>
        </aside>
      </main>
    </div>
  );
}
