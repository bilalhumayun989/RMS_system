import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'accent' | 'primary';
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md', variant = 'accent', ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-spin rounded-full border-t-transparent',
          {
            'w-4 h-4 border-2': size === 'sm',
            'w-6 h-6 border-2': size === 'md',
            'w-10 h-10 border-4': size === 'lg',
            'border-[#FF7A10]': variant === 'accent',
            'border-[#1F221D]': variant === 'primary',
          }
        ),
        className
      )}
      {...props}
    />
  );
};

export default Spinner;
