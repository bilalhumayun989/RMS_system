import { gsap } from 'gsap';

// Page enter animation
export const pageEnter = (container: HTMLElement) => {
  gsap.fromTo(container,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );
};

// Stagger cards animation
export const staggerCards = (cards: HTMLElement[]) => {
  gsap.fromTo(cards,
    { opacity: 0, y: 30, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.07, ease: 'power2.out' }
  );
};

// Button hover (call on mouseenter/mouseleave)
export const buttonHover = (btn: HTMLElement, entering: boolean) => {
  gsap.to(btn, { scale: entering ? 1.03 : 1, duration: 0.2, ease: 'power1.out' });
};

// Number count-up
export const countUp = (el: HTMLElement, endValue: number) => {
  gsap.fromTo({ val: 0 }, { val: endValue },
    { duration: 1, ease: 'power2.out',
      onUpdate: function() { 
        const target = this.targets()[0] as { val: number };
        el.textContent = Math.round(target.val).toLocaleString(); 
      }
    }
  );
};

// Cart item add bounce
export const cartAddBounce = (el: HTMLElement) => {
  gsap.timeline()
    .to(el, { scale: 1.15, duration: 0.15, ease: 'power2.out' })
    .to(el, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.5)' });
};

// Status change (kitchen kanban)
export const statusTransition = (el: HTMLElement) => {
  gsap.fromTo(el,
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
  );
};

// Payment success
export const paymentSuccess = (checkmark: HTMLElement, overlay: HTMLElement) => {
  gsap.timeline()
    .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    .fromTo(checkmark, { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
};
