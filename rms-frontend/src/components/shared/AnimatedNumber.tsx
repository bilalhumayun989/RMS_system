import React, { useEffect, useRef } from 'react';
import { countUp } from '../../utils/animations';

export interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
}
// hi
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, prefix = '', suffix = '' }) => {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (elRef.current) {
      countUp(elRef.current, value);
    }
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}
      <span ref={elRef}>0</span>
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
