'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  "inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider border select-none",
  {
    variants: {
      variant: {
        default: "bg-surface text-text-primary border-border-divider",
        accent: "bg-accent/10 text-accent border-accent/20",
        source: "bg-bg-app text-text-muted border-border-divider",
        rating: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
        destructive: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        success: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-[4px]",
      }
    },
    defaultVariants: {
      variant: "default",
      radius: "none",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, radius, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, radius }), className)} {...props} />
  );
}
