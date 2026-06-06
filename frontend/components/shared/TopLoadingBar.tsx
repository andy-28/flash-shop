"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopLoadingBar() {
  const pathname = usePathname();
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    setRunId((value) => value + 1);
  }, [pathname]);

  if (runId === 0) {
    return null;
  }

  return (
    <div
      key={runId}
      className="fixed left-0 top-0 z-[9999] h-0.5 bg-white shadow-[0_0_18px_rgba(255,255,255,0.45)] animate-top-bar"
    />
  );
}
