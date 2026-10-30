import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
});

export const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion:reduce)').matches;

export function startSmoothScroll() {
  if (typeof window !== 'undefined' && window.__lenis) {
    window.__lenis.start();
  }
}

export function stopSmoothScroll() {
  if (typeof window !== 'undefined' && window.__lenis) {
    window.__lenis.stop();
  }
}

export function scrollToId(id) {
  let targetId = id;
  if (id === '#home') targetId = '#top';
  if (id === '#villa') targetId = '#experience';
  if (id === '#plans') targetId = '#choices';
  if (id === '#confidence') targetId = '#testimonials';

  const el = document.querySelector(targetId) || document.querySelector(id);
  if (!el) return;
  if (typeof window !== 'undefined' && window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -60 });
  } else {
    el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
  history.replaceState(null, '', id);
}

export { gsap, ScrollTrigger };
