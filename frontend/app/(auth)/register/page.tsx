"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const register = useAuthStore((state) => state.register);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      await register(email, password, name);
      await fetchCart();
      toast.success("註冊成功");
      router.push("/products");
    } catch {
      setError("註冊失敗，請確認 Email 是否已被使用。");
      toast.error("註冊失敗，請確認 Email 是否已被使用。");
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg-primary px-4 text-text-primary">
      <form onSubmit={submit} aria-busy={isLoading} className="w-full max-w-sm rounded-md border border-border-default bg-bg-secondary p-5">
        <h1 className="text-2xl font-semibold">註冊</h1>
        <p className="mt-2 text-sm text-text-secondary">建立帳號後即可使用購物車、訂單與社群功能。</p>
        <div className="mt-5 space-y-3">
          <input value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none focus:border-accent-primary disabled:opacity-60" placeholder="Name" required disabled={isLoading} />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none focus:border-accent-primary disabled:opacity-60" placeholder="Email" type="email" required disabled={isLoading} />
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none focus:border-accent-primary disabled:opacity-60" placeholder="Password" type="password" required disabled={isLoading} />
        </div>
        {error ? <p className="mt-3 text-sm text-status-danger">{error}</p> : null}
        <LoadingButton className="mt-5" fullWidth isLoading={isLoading} loadingText="註冊中..." type="submit">
          註冊
        </LoadingButton>
        <p className="mt-4 text-center text-sm text-text-secondary">
          已經有帳號？{" "}
          <Link href="/login" className="text-text-primary underline">
            登入
          </Link>
        </p>
      </form>
    </main>
  );
}
