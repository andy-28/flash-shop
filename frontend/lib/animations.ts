export const animations = {
  fadeIn: "animate-fade-in",
  fadeInUp: "animate-fade-in-up",
  fadeInDown: "animate-fade-in-down",
  fadeInLeft: "animate-fade-in-left",
  fadeInRight: "animate-fade-in-right",
  scaleIn: "animate-scale-in",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  heartbeat: "animate-heartbeat",
  shake: "animate-shake",
  transition: {
    default: "transition-all duration-300 ease-out",
    fast: "transition-all duration-150 ease-out",
    slow: "transition-all duration-500 ease-out",
    spring: "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  },
} as const;
