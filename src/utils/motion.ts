/**
 * Unified Motion Physics Engine for Kagami
 * Author: Creative Technologist & Graphic Performance Engineer
 */

// Phase 1 Springs
export const snappySpring = {
  type: 'spring' as const,
  stiffness: 450,
  damping: 26,
  mass: 0.7,
};

export const cinematicSpring = {
  type: 'spring' as const,
  stiffness: 160,
  damping: 24,
  mass: 1.2,
};

/**
 * Calculates dynamic mass based on element area.
 * M = clamp((Width * Height) / 250000, 0.6, 1.5)
 */
export function getDynamicMass(width: number, height: number): number {
  const area = width * height;
  const rawMass = area / 250000;
  return Math.min(Math.max(rawMass, 0.6), 1.5);
}

/**
 * Creates dynamic bento layout spring
 */
export function getBentoSpring(width: number, height: number) {
  return {
    type: 'spring' as const,
    stiffness: 240,
    damping: 28,
    mass: getDynamicMass(width, height),
  };
}

/**
 * Phase 2 Asymmetric Bento Entrance Wave Stagger calculation
 * Delay = sqrt((x_c - x_0)^2 + (y_c - y_0)^2) * 0.0002
 * Coordinates are computed in pixels based on colWidth and rowHeight
 */
export function calculateWaveStaggerDelay(
  index: number,
  cols: number = 3,
  colWidth: number = 220,
  rowHeight: number = 300
): number {
  const col = index % cols;
  const row = Math.floor(index / cols);
  
  const x_c = col * colWidth;
  const y_c = row * rowHeight;
  
  const distance = Math.sqrt(x_c * x_c + y_c * y_c);
  return distance * 0.0002;
}

/**
 * Standard Bento Grid Card Entrance animation variants
 */
export const bentoGridItemVariants = {
  hidden: {
    y: 30,
    scale: 0.97,
    opacity: 0,
  },
  visible: (customDelay: number) => ({
    y: 0,
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 240,
      damping: 28,
      mass: 0.8, // standard card mass
      delay: customDelay,
    },
  }),
};
