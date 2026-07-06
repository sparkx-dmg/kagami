'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useScroll, useVelocity, useTransform, useAnimation } from 'framer-motion';

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

// ─── Module 2: Kinetic Typography Character Flippers ──────────────────────────
interface KineticTypographyProps {
  text: string;
  className?: string;
  delay?: number;
}

export function KineticTypography({ text, className, delay = 0 }: KineticTypographyProps) {
  const characters = text.split('');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.025,
        delayChildren: delay,
      },
    },
  };

  const characterVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      rotateX: -90,
      y: 12,
    },
    visible: {
      opacity: 1,
      scale: [0, 1.2, 1.0],
      rotateX: 0,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 320,
        damping: 16,
        mass: 0.75,
        scale: {
          times: [0, 0.6, 1],
          duration: 0.4,
        },
      },
    },
  };

  return (
    <motion.span
      aria-label={text}
      className={`inline-flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          aria-hidden="true"
          className="inline-block origin-bottom"
          variants={characterVariants}
          style={{
            whiteSpace: char === ' ' ? 'pre' : 'normal',
            willChange: 'transform, opacity',
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─── Module 3: Global Spatial Proximity Ripples & Cursor Distortion Fields ───
export function ProximityDistortion({
  children,
  className,
  active = true,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 180, damping: 18 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    if (!active) return;

    let rect: DOMRect | null = null;
    let lastUpdate = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      
      const now = performance.now();
      if (!rect || now - lastUpdate > 150) {
        rect = containerRef.current.getBoundingClientRect();
        lastUpdate = now;
      }

      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;
      
      const dx = e.clientX - elCx;
      const dy = e.clientY - elCy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        const force = (150 - distance) / 150; // 0 to 1
        const pushX = -(dx / distance) * 8 * force;
        const pushY = -(dy / distance) * 8 * force;
        x.set(pushX);
        y.set(pushY);

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        containerRef.current.style.setProperty('--cursor-angle', `${angle}deg`);
        containerRef.current.style.setProperty('--cursor-proximity', `${force}`);
      } else {
        x.set(0);
        y.set(0);
        containerRef.current.style.setProperty('--cursor-proximity', '0');
      }
    };

    const handleScrollOrResize = () => {
      rect = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [active, x, y]);

  return (
    <motion.div
      ref={containerRef}
      style={{
        x: springX,
        y: springY,
        willChange: 'transform',
        position: 'relative',
      }}
      className={className}
    >
      {/* 1px glowing trail border overlay */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-30"
        style={{
          border: '1px solid transparent',
          backgroundImage: `linear-gradient(var(--bg-app, #0B0B0A), var(--bg-app, #0B0B0A)), linear-gradient(var(--cursor-angle, 0deg), var(--accent-base, #F5F5F0) 0%, transparent 60%)`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          opacity: 'calc(var(--cursor-proximity, 0) * 0.85)',
          mixBlendMode: 'screen',
        }}
      />
      {children}
    </motion.div>
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
      scaleX: 1.15,
      scaleY: 0.85,
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
        damping: 10,
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

// ─── Module 5: Multi-Tier Velocity-Linked Parallax & Depth Layers ────────────
export function InertialBadge({
  children,
  className,
  multiplier = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  multiplier?: number;
}) {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  
  const yShift = useTransform(scrollVelocity, (latestVel) => {
    return -latestVel * multiplier * 0.02;
  });
  
  const springY = useSpring(yShift, { stiffness: 220, damping: 20 });

  return (
    <motion.div
      style={{
        y: springY,
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxBackdrop({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 1000], [0, -20]);
  const springY = useSpring(yOffset, { stiffness: 100, damping: 25 });

  return (
    <motion.div
      style={{
        y: springY,
        backgroundImage: `url(${src})`,
        willChange: 'transform',
      }}
      className={className}
    />
  );
}
