"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

const demoAccounts = {
  admin: { email: "admin@flashshop.dev", password: "Admin123!" },
  buyer: { email: "buyer@test.com", password: "Test123!" },
};

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const login = useAuthStore((state) => state.login);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [email, setEmail] = useState(demoAccounts.admin.email);
  const [password, setPassword] = useState(demoAccounts.admin.password);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    setReason(new URLSearchParams(window.location.search).get("reason"));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast.success("登入成功");
      const user = useAuthStore.getState().user;
      if (user?.role === "Admin") {
        router.push("/admin/content");
        return;
      }

      await fetchCart();
      router.push("/products");
    } catch {
      setError("登入失敗，請確認 Email 和密碼是否正確。");
      toast.error("登入失敗，請確認帳號密碼。");
      setIsLoading(false);
    }
  }

  function selectDemoAccount(type: keyof typeof demoAccounts) {
    if (isLoading) return;
    setEmail(demoAccounts[type].email);
    setPassword(demoAccounts[type].password);
    setError(null);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <form onSubmit={submit} aria-busy={isLoading} className="w-full max-w-sm rounded-md border border-[#2A2A2A] bg-[#141414] p-5">
        <h1 className="text-2xl font-semibold">登入</h1>
        <p className="mt-2 text-sm text-[#A0A0A0]">
          {reason === "admin" ? "請使用 Admin 帳號登入後台。" : "登入後可以購物、下單、發文與管理內容。"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="h-9 rounded-md border border-white/10 bg-white text-sm font-medium text-black disabled:opacity-60" disabled={isLoading} onClick={() => selectDemoAccount("admin")}>
            Admin 帳號
          </button>
          <button type="button" className="h-9 rounded-md border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/10 disabled:opacity-60" disabled={isLoading} onClick={() => selectDemoAccount("buyer")}>
            Buyer 帳號
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none focus:border-white disabled:opacity-60" placeholder="Email" type="email" required disabled={isLoading} />
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none focus:border-white disabled:opacity-60" placeholder="Password" type="password" required disabled={isLoading} />
        </div>
        {error ? <p className="mt-3 text-sm text-[#EF4444]">{error}</p> : null}
        <LoadingButton className="mt-5" fullWidth isLoading={isLoading} loadingText="登入中..." type="submit">
          登入
        </LoadingButton>
        <p className="mt-4 text-center text-sm text-[#A0A0A0]">
          還沒有帳號？{" "}
          <Link href="/register" className="text-white underline">
            註冊
          </Link>
        </p>
      </form>
    </main>
  );
}
