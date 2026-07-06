'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-border-divider/50 rounded-none",
        className
      )}
      {...props}
    />
  );
}
