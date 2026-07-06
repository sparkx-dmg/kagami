/**
 * Kagami Shared Animation Variants
 * GPU-isolated spring-physics presets for consistent motion across all pages.
 * All properties are transform/opacity only — no layout triggers.
 */

// ─── Page-level entrance ────────────────────────────────────────────────────
export const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 28 },
  },
} as const;

// ─── Staggered container + child ───────────────────────────────────────────
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
} as const;

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.02, delayChildren: 0.02 },
  },
} as const;

export const fadeUpItem = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
} as const;

export const fadeLeftItem = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 340, damping: 26 },
  },
} as const;

export const fadeRightItem = {
  hidden: { opacity: 0, x: 12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 340, damping: 26 },
  },
} as const;

export const scaleInItem = {
  hidden: { opacity: 0, scale: 0.88 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 380, damping: 24 },
  },
} as const;

// ─── Interactive element presets ───────────────────────────────────────────
export const hoverLift = {
  whileHover: { y: -3, scale: 1.015 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 420, damping: 22 },
} as const;

export const hoverScale = {
  whileHover: { scale: 1.06 },
  whileTap: { scale: 0.93 },
  transition: { type: 'spring', stiffness: 450, damping: 22 },
} as const;

export const hoverBounce = {
  whileHover: { y: -4, scale: 1.03 },
  whileTap: { y: 1, scale: 0.97 },
  transition: { type: 'spring', stiffness: 500, damping: 18 },
} as const;

// ─── Header slide-down entrance ────────────────────────────────────────────
export const headerVariants = {
  hidden: { opacity: 0, y: -16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 30 },
  },
} as const;

// ─── Modal / overlay entrance ──────────────────────────────────────────────
export const overlayVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
} as const;

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.16 },
  },
} as const;

// ─── Kinetic Physics Presets ────────────────────────────────────────────────
export const TACTILE_SPRING = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
  mass: 0.6,
} as const;

export const FLUID_SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 26,
  mass: 1.0,
} as const;

export const CINEMATIC_SPRING = {
  type: 'spring',
  stiffness: 150,
  damping: 22,
  mass: 1.2,
} as const;
