'use client';

import React from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "w-9 h-5 bg-surface border border-border-divider transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2 rounded-none",
            "peer-checked:bg-accent peer-checked:border-accent",
            "after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-text-muted after:border-none after:h-3 after:w-3 after:transition-all after:rounded-none",
            "peer-checked:after:translate-x-4 peer-checked:after:bg-accent-foreground",
            className
          )}
        />
      </label>
    );
  }
);

Switch.displayName = 'Switch';
