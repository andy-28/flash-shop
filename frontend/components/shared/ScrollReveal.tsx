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
  fadeIn: "animate-fade-in",
  fadeInUp: "animate-fade-in-up",
  fadeInLeft: "animate-fade-in-left",
  fadeInRight: "animate-fade-in-right",
  scaleIn: "animate-scale-in",
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
