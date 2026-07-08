'use client';

import React, { useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

// ─── Module 1: Zero-G Ambient Floating Loops (Disabled Ambient Sway) ──────────
interface ZeroGFloatingProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

export function ZeroGFloating({ children, className }: ZeroGFloatingProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// ─── Module 2: Snappy Kinetic Typography (Subtle Block Fade-In) ─────────────────
interface KineticTypographyProps {
  text: string;
  className?: string;
  delay?: number;
}

export function KineticTypography({ text, className, delay = 0 }: KineticTypographyProps) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 22,
        delay: delay,
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {text}
    </motion.span>
  );
}

// ─── Module 3: Native CSS Proximity & Border Glow ──────────────────────────────
export function ProximityDistortion({
  children,
  className,
  active = true,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div className={`relative group/distortion ${className}`}>
      {/* 1px glowing trail border overlay using CSS hover transition */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none border border-border-divider/50 transition-all duration-300 opacity-0 group-hover/distortion:opacity-100 group-hover/distortion:border-accent/40 z-30"
      />
      {children}
    </div>
  );
}

// ─── Module 4: Squash-and-Stretch Balloon Micro-Click Physics ──────────────────
export function BalloonClick({
  children,
  className,
  style,
  ...restProps
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.ComponentPropsWithoutRef<typeof motion.div>) {
  const controls = useAnimation();

  const handlePointerDown = () => {
    controls.start({
      scaleX: 1.12,
      scaleY: 0.88,
      transition: { type: 'spring', stiffness: 500, damping: 15 }
    });
  };

  const handlePointerUp = () => {
    controls.start({
      scaleX: 1.0,
      scaleY: 1.0,
      transition: {
        type: 'spring',
        stiffness: 800,
        damping: 12,
        mass: 0.5,
      }
    });
  };

  return (
    <motion.div
      className={className}
      animate={controls}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseLeave={handlePointerUp}
      style={{ willChange: 'transform', display: 'inline-block', ...style }}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}

// ─── Module 5: Lightweight Static / Pure CSS Parallax & Depth Layers ───────────
export function InertialBadge({
  children,
  className,
  multiplier = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  multiplier?: number;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function ParallaxBackdrop({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div
      style={{
        backgroundImage: `url(${src})`,
      }}
      className={className}
    />
  );
}
