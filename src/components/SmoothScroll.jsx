import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reduceMotion } from '../lib/scroll.js';

export default function SmoothScroll() {
  useEffect(() => {
    if (reduceMotion()) return;
    ScrollTrigger.config({ ignoreMobileResize: true });
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
  return null;
}

