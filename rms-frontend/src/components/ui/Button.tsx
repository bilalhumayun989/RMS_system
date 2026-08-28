import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer',
            {
              // Primary — orange fill
              'bg-[#FF7A10] text-white hover:bg-[#E86000] border border-transparent': variant === 'primary',
              // Secondary — white with dark border
              'bg-white text-[#1F221D] border border-[#1F221D]/15 hover:bg-[#F4F2F0]': variant === 'secondary',
              // Ghost
              'bg-transparent text-[#555754] hover:text-[#1F221D] hover:bg-[#F4F2F0]': variant === 'ghost',
              // Danger
              'bg-[#C62828] text-white hover:bg-[#B71C1C]': variant === 'danger',
              // Success
              'bg-[#2E7D32] text-white hover:bg-[#1B5E20]': variant === 'success',
            },
            {
              'px-3 py-1.5 text-xs rounded-lg': size === 'sm',
              'px-4 py-2 text-sm rounded-xl': size === 'md',
              'px-5 py-2.5 text-base rounded-xl': size === 'lg',
              'px-6 py-3.5 text-lg rounded-2xl': size === 'xl',
            }
          ),
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
