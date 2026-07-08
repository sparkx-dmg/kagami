/**
 * Kagami Shared Animation Variants
 * GPU-isolated dampened cubic-bezier curves for high-velocity transitions.
 * Maximum duration limits enforced at 120ms to 180ms.
 */

export const FAST_CURVE = [0.16, 1, 0.3, 1] as const;

// ─── Page-level entrance (150ms Dampened Ease-Out) ──────────────────────────
export const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: FAST_CURVE, duration: 0.15 },
  },
} as const;

// ─── Staggered container + child (Snappy 10ms - 20ms steps) ────────────────
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.015, delayChildren: 0.02 },
  },
} as const;

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.01, delayChildren: 0.01 },
  },
} as const;

export const fadeUpItem = {
  hidden: { opacity: 0, y: 6, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ease: FAST_CURVE, duration: 0.15 },
  },
} as const;

export const fadeLeftItem = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { ease: FAST_CURVE, duration: 0.15 },
  },
} as const;

export const fadeRightItem = {
  hidden: { opacity: 0, x: 6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { ease: FAST_CURVE, duration: 0.15 },
  },
} as const;

export const scaleInItem = {
  hidden: { opacity: 0, scale: 0.97 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { ease: FAST_CURVE, duration: 0.15 },
  },
} as const;

// ─── Interactive element presets (Ultra-Fast 120ms Responses) ─────────────
export const hoverLift = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { ease: FAST_CURVE, duration: 0.12 },
} as const;

export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.96 },
  transition: { ease: FAST_CURVE, duration: 0.12 },
} as const;

export const hoverBounce = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { y: 0.5, scale: 0.99 },
  transition: { ease: FAST_CURVE, duration: 0.12 },
} as const;

// ─── Header slide-down entrance ────────────────────────────────────────────
export const headerVariants = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: FAST_CURVE, duration: 0.15 },
  },
} as const;

// ─── Modal / overlay entrance ──────────────────────────────────────────────
export const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { ease: 'easeOut', duration: 0.12 } },
} as const;

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ease: FAST_CURVE, duration: 0.15 },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    y: 4,
    transition: { ease: 'easeIn', duration: 0.1 },
  },
} as const;

// ─── Core Physics / Tween Fallbacks ────────────────────────────────────────
export const TACTILE_SPRING = {
  type: 'tween',
  ease: FAST_CURVE,
  duration: 0.15,
} as const;

export const FLUID_SPRING = {
  type: 'tween',
  ease: FAST_CURVE,
  duration: 0.18,
} as const;

export const CINEMATIC_SPRING = {
  type: 'tween',
  ease: FAST_CURVE,
  duration: 0.22,
} as const;
