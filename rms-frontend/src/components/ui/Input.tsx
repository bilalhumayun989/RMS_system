import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="relative w-full flex items-center">
          {icon && (
            <div className="absolute left-4 text-[#555754] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-3 text-sm text-[#1F221D] placeholder-[#555754]/50 focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all',
                {
                  'pl-11': !!icon,
                  'border-[#C62828]/50 focus:border-[#C62828]/50': !!error,
                }
              ),
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-[#C62828] px-1">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
