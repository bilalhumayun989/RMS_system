import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'yellow' | 'blue' | 'green' | 'red' | 'gray';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'gray', children, ...props }) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border',
          {
            'bg-[#FF7A10]/10 text-[#FF7A10] border-[#FF7A10]/20': variant === 'yellow',
            'bg-[#1565C0]/10 text-[#1565C0] border-[#1565C0]/20': variant === 'blue',
            'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20': variant === 'green',
            'bg-[#C62828]/10 text-[#C62828] border-[#C62828]/20': variant === 'red',
            'bg-[#ECEAE7] text-[#555754] border-[#1F221D]/10': variant === 'gray',
          }
        ),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
