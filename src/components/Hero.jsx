import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reduceMotion } from '../lib/scroll.js';
import { asset } from '../lib/assets.js';

const MOBILE_QUERY = '(max-width: 767px)';

const VIDEO_DESKTOP = 'images/new/slider/DeskSlider.mp4';
const VIDEO_MOBILE = 'images/new/slider/Mobslider02.mp4';
const POSTER_DESKTOP = 'images/new/slider/deskpreloader.webp';
const POSTER_MOBILE = 'images/new/slider/mobpreloader.webp';

export default function Hero() {
  const secRef = useRef(null);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  // Track viewport changes so the right video is used
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Scroll zoom effect (unchanged)
  useEffect(() => {
    if (reduceMotion()) return;
    const media = mediaRef.current;
    const sec = secRef.current;
    if (!media || !sec) return;

    const tween = gsap.fromTo(
      media,
      { y: 0, scale: 1 },
      {
        y: 0,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger && tween.scrollTrigger.kill();
      tween.kill();
    };
  }, []);

  // Autoplay handling + reduced motion (re-runs when the source switches)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (reduceMotion()) {
      v.pause();
    } else {
      v.play().catch(() => {});
    }
  }, [isMobile]);

  return (
    <section id="hero" className="hero-banner" ref={secRef}>
      <div id="home" style={{ position: 'absolute', top: 0 }}></div>
      <div className="hero-banner-media" ref={mediaRef}>
        <video
          key={isMobile ? 'mobile' : 'desktop'}
          ref={videoRef}
          className="hero-image"
          src={asset(isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP)}
          poster={asset(isMobile ? POSTER_MOBILE : POSTER_DESKTOP)}
          autoPlay={!reduceMotion()}
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Luxury residences"
          onLoadedData={() => ScrollTrigger && ScrollTrigger.refresh()}
        />
        {/* <span className="artist-tag">Artist's Impression</span> */}
      </div>
    </section>
  );
}