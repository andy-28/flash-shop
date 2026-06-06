"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const typeConfig = {
  success: { icon: CheckCircle2, bar: "bg-status-success" },
  error: { icon: XCircle, bar: "bg-status-danger" },
  info: { icon: Info, bar: "bg-status-info" },
  warning: { icon: AlertTriangle, bar: "bg-status-warning" },
};

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);
  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, type, message }]);
    window.setTimeout(() => remove(id), 3000);
  }, [remove]);
  const api = useMemo<ToastApi>(() => ({
    success: (message) => push("success", message),
    error: (message) => push("error", message),
    info: (message) => push("info", message),
    warning: (message) => push("warning", message),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-[60] grid w-full max-w-sm gap-3">
        {items.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div className="overflow-hidden rounded-lg border border-border-default bg-bg-tertiary shadow-xl" key={item.id}>
              <div className="flex items-center gap-3 p-3">
                <span className={`h-10 w-1 rounded-full ${config.bar}`} />
                <Icon className="size-4 text-text-primary" />
                <p className="min-w-0 flex-1 text-sm text-text-primary">{item.message}</p>
                <button className="text-text-secondary hover:text-text-primary" type="button" onClick={() => remove(item.id)}>
                  <X className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
