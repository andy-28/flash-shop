"use client";

import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/lib/hooks/useScrollReveal";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "fadeInUp" | "fadeInLeft" | "fadeInRight" | "fadeIn" | "scaleIn";
  delay?: number;
  className?: string;
}

const animationClass = {
  fadeIn: "animate-fadeIn",
  fadeInUp: "animate-fadeInUp",
  fadeInLeft: "animate-fadeInLeft",
  fadeInRight: "animate-fadeInRight",
  scaleIn: "animate-scaleIn",
};

export function ScrollReveal({ animation = "fadeInUp", children, className, delay }: Readonly<ScrollRevealProps>) {
  const { ref, isVisible } = useScrollReveal();
  const safeDelay = delay ? Math.min(Math.max(delay, 1), 8) : undefined;

  return (
    <div
      ref={ref}
      className={cn(isVisible ? animationClass[animation] : "opacity-0", safeDelay && `stagger-${safeDelay}`, className)}
    >
      {children}
    </div>
  );
}
