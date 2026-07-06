'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FLUID_SPRING } from '@/utils/animations';

const WaveContext = createContext<{
  register: (id: string, ref: React.RefObject<HTMLDivElement | null>) => void;
  unregister: (id: string) => void;
  delays: Record<string, number>;
  isAnimating: boolean;
} | null>(null);

export function EuclideanWaveContainer({ children }: { children: React.ReactNode }) {
  const [delays, setDelays] = useState<Record<string, number>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const registry = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  const register = (id: string, ref: React.RefObject<HTMLDivElement | null>) => {
    registry.current[id] = ref;
  };

  const unregister = (id: string) => {
    delete registry.current[id];
  };

  useEffect(() => {
    // Wait slightly for hydration and dynamic content to render layout positions
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const newDelays: Record<string, number> = {};

      Object.entries(registry.current).forEach(([id, ref]) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const elCx = rect.left + rect.width / 2;
        const elCy = rect.top + rect.height / 2;
        const distance = Math.sqrt((elCx - cx) ** 2 + (elCy - cy) ** 2);
        // Wave step delay: delay = distance * 0.00015s
        newDelays[id] = distance * 0.00015;
      });

      setDelays(newDelays);
      setIsAnimating(true);
    }, 120);

    return () => clearTimeout(timer);
  }, []);

  return (
    <WaveContext.Provider value={{ register, unregister, delays, isAnimating }}>
      {children}
    </WaveContext.Provider>
  );
}

interface EuclideanWaveItemProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
  id: string;
}

export function EuclideanWaveItem({ children, id, className, style, ...restProps }: EuclideanWaveItemProps) {
  const context = useContext(WaveContext);
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    if (context) {
      context.register(id, ref);
    }
    return () => {
      if (context) {
        context.unregister(id);
      }
    };
  }, [id, context]);

  useEffect(() => {
    if (context?.isAnimating) {
      const delay = context.delays[id] || 0;
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          ...FLUID_SPRING,
          delay: delay,
        },
      });
    }
  }, [context?.isAnimating, context?.delays, id, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={controls}
      className={className}
      style={{ willChange: 'transform, opacity', ...style }}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}
