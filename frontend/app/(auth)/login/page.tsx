"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [email, setEmail] = useState("buyer@test.com");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      await fetchCart();
      router.push("/products");
    } catch {
      setError("登入失敗，請確認帳號密碼。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-md border border-[#2A2A2A] bg-[#141414] p-5">
        <h1 className="text-2xl font-semibold">登入</h1>
        <p className="mt-2 text-sm text-[#A0A0A0]">登入後可以使用購物車。</p>
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
          {isLoading ? "登入中" : "登入"}
        </button>
        <p className="mt-4 text-center text-sm text-[#A0A0A0]">
          沒有帳號？{" "}
          <Link href="/register" className="text-white underline">
            註冊
          </Link>
        </p>
      </form>
    </main>
  );
}
