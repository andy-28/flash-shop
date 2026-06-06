export const animations = {
  fadeIn: "animate-fadeIn",
  fadeInUp: "animate-fadeInUp",
  fadeInDown: "animate-fadeInDown",
  fadeInLeft: "animate-fadeInLeft",
  fadeInRight: "animate-fadeInRight",
  scaleIn: "animate-scaleIn",
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
