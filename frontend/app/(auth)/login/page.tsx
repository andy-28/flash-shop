"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

const demoAccounts = {
  admin: { email: "admin@flashshop.dev", password: "Admin123!" },
  buyer: { email: "buyer@test.com", password: "Test123!" },
};

export default function LoginPage() {
  const router = useRouter();
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
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      if (user?.role === "Admin") {
        router.push("/admin/content");
        return;
      }

      await fetchCart();
      router.push("/products");
    } catch {
      setError("登入失敗，請確認帳號密碼。");
    } finally {
      setIsLoading(false);
    }
  }

  function selectDemoAccount(type: keyof typeof demoAccounts) {
    setEmail(demoAccounts[type].email);
    setPassword(demoAccounts[type].password);
    setError(null);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-md border border-[#2A2A2A] bg-[#141414] p-5">
        <h1 className="text-2xl font-semibold">登入</h1>
        <p className="mt-2 text-sm text-[#A0A0A0]">
          {reason === "admin" ? "請使用 Admin 帳號進入後台。" : "登入後可以管理後台或繼續購物。"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="h-9 rounded-md border border-white/10 bg-white text-sm font-medium text-black"
            onClick={() => selectDemoAccount("admin")}
          >
            Admin 帳號
          </button>
          <button
            type="button"
            className="h-9 rounded-md border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/10"
            onClick={() => selectDemoAccount("buyer")}
          >
            Buyer 帳號
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none focus:border-white"
            placeholder="Email"
            type="email"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none focus:border-white"
            placeholder="Password"
            type="password"
            required
          />
        </div>
        {error ? <p className="mt-3 text-sm text-[#EF4444]">{error}</p> : null}
        <button className="mt-5 h-10 w-full rounded-md bg-white text-sm font-medium text-black" disabled={isLoading}>
          {isLoading ? "登入中..." : "登入"}
        </button>
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
