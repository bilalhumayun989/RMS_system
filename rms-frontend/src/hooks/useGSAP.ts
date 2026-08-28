import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const useGSAP = (
  animationCallback: (ctx: gsap.Context) => void,
  dependencies: any[] = []
) => {
  const containerRef = useRef<any>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      animationCallback(ctx);
    }, containerRef);

    return () => ctx.revert();
  }, dependencies);

  return containerRef;
};

export default useGSAP;
