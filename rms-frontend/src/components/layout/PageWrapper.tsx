import React, { useEffect, useRef } from 'react';
import { pageEnter } from '../../utils/animations';

export interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      pageEnter(containerRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
