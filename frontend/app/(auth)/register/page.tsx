"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [name, setName] = useState("Buyer");
  const [email, setEmail] = useState("buyer@test.com");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(email, password, name);
      await fetchCart();
      router.push("/products");
    } catch {
      setError("註冊失敗，這個 email 可能已經被使用。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-md border border-[#2A2A2A] bg-[#141414] p-5">
        <h1 className="text-2xl font-semibold">註冊</h1>
        <p className="mt-2 text-sm text-[#A0A0A0]">建立帳號後購物車會同步到資料庫。</p>
        <div className="mt-5 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none focus:border-white"
            placeholder="Name"
            required
          />
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
          {isLoading ? "註冊中" : "註冊"}
        </button>
        <p className="mt-4 text-center text-sm text-[#A0A0A0]">
          已有帳號？{" "}
          <Link href="/login" className="text-white underline">
            登入
          </Link>
        </p>
      </form>
    </main>
  );
}
