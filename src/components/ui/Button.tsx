'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center font-mono text-xs font-medium uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 border select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground border-accent hover:bg-accent/90 hover:border-accent/90",
        secondary: "bg-surface text-text-primary border-border-divider hover:bg-bg-app hover:border-text-muted",
        ghost: "bg-transparent text-text-primary border-transparent hover:bg-surface/50 hover:border-border-divider",
        outline: "bg-transparent text-text-primary border-border-divider hover:bg-surface hover:border-text-primary",
        destructive: "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 dark:bg-red-700 dark:border-red-700 dark:hover:bg-red-800",
      },
      size: {
        sm: "h-8 px-3 py-1 text-[10px]",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-sm",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
      }
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
      radius: "sm",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

import { motion, useAnimation } from 'framer-motion';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, ...props }, ref) => {
    const controls = useAnimation();

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      controls.start({
        scaleX: 1.06,
        scaleY: 0.94,
        transition: { type: 'spring', stiffness: 600, damping: 18 }
      });
      if (props.onPointerDown) props.onPointerDown(e);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
      controls.start({
        scaleX: 1.0,
        scaleY: 1.0,
        transition: {
          type: 'spring',
          stiffness: 900,
          damping: 14,
          mass: 0.4,
        }
      });
      if (props.onPointerUp) props.onPointerUp(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      controls.start({
        scaleX: 1.0,
        scaleY: 1.0,
        transition: {
          type: 'spring',
          stiffness: 900,
          damping: 14,
          mass: 0.4,
        }
      });
      if (props.onMouseLeave) props.onMouseLeave(e);
    };

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, radius }), className)}
        ref={ref as any}
        animate={controls}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp as any}
        onMouseLeave={handleMouseLeave}
        style={{ willChange: 'transform' }}
        {...(props as any)}
      />
    );
  }
);

Button.displayName = 'Button';
