import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ className, vertical = false, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          vertical ? 'w-[1px] bg-white/10' : 'h-[1px] w-full bg-white/10'
        ),
        className
      )}
      {...props}
    />
  );
};

export default Divider;
