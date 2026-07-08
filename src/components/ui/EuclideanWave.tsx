'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function EuclideanWaveContainer({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface EuclideanWaveItemProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
  id: string;
}

export function EuclideanWaveItem({ children, className, style, ...restProps }: EuclideanWaveItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
      className={className}
      style={{ willChange: 'transform, opacity', ...style }}
      {...restProps}
    >
      {children}
    </motion.div>
  );
}
