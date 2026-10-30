import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, scrollToId, reduceMotion } from '../lib/scroll.js';
import { asset } from '../lib/assets.js';

const SLIDES = [
  { desktop: 'gated_community_d', mobile: 'gated_community', label: '88-acre gated community' },
  { desktop: 'open_spaces_d', mobile: 'open_spaces', label: '40% open spaces' },
  { desktop: 'gardens_d', mobile: 'gardens', label: 'Six gardens' },
  { desktop: 'nature_trail_d', mobile: 'nature_trail', label: 'Nature trails and a natural stream' },
  { desktop: 'clubhouses_d', mobile: 'clubhouses', label: 'Two planned clubhouses with recreational amenities' },
];

const STATS = [
  {  label: '88-acre gated community' },
  { label: '40% open spaces' },
  {  label: 'Six gardens' },
  { label: 'Nature trails and a natural stream' },
  { label: 'Two planned clubhouses with recreational amenities' },
];

export default function Community({ onBook }) {
  const secRef = useRef(null);
  const bgsRef = useRef(null);
  const dotsRef = useRef(null);

  useEffect(() => {
    const sec = secRef.current;
    const stats = gsap.utils.toArray('.stat', sec);
    const dots = Array.from(dotsRef.current.querySelectorAll('i'));
    const setDot = (i) => dots.forEach((d, k) => d.classList.toggle('on', k === i));
    setDot(0);

    if (reduceMotion()) {
      if (stats[0]) stats[0].style.opacity = 1;
      stats.forEach((el) => {
        const span = el.querySelector('[data-to]');
        if (span) {
          const target = +span.dataset.to;
          span.textContent = target < 10 ? String(target).padStart(2, '0') : String(target);
        }
      });
      return;
    }

    let offMove = null;
    const ctx = gsap.context(() => {
      const N = stats.length;
      const slides = gsap.utils.toArray('.comm-bg-slide', sec);

      slides.forEach((slide, i) => {
        gsap.set(slide, {
          opacity: i === 0 ? 1 : 0,
          scale: 1.02,
          zIndex: i + 1,
        });
      });

      stats.forEach((el, i) => {
        gsap.set(el, {
          opacity: i === 0 ? 1 : 0,
          y: i === 0 ? 0 : 35,
        });
      });

      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      const stepDur = 2.0;
      const fadeDur = 1.0; // Generous, silky-smooth cross-fade

      // Ken Burns continuous slow drift & seamless cross-fade on each slide
      slides.forEach((slide, i) => {
        const startTime = i === 0 ? 0 : (i - 1) * stepDur + (stepDur - fadeDur);
        const totalDur = i === 0 ? stepDur + fadeDur : stepDur + fadeDur * 1.5;

        // Continuous subtle zoom without stopping
        tl.fromTo(
          slide,
          { scale: 1.02 },
          { scale: 1.08, duration: totalDur, ease: 'none' },
          startTime
        );

        // Smooth dissolution of incoming slide over the previous slide
        if (i > 0) {
          tl.fromTo(
            slide,
            { opacity: 0 },
            { opacity: 1, duration: fadeDur, ease: 'none' },
            (i - 1) * stepDur + (stepDur - fadeDur)
          );
        }
      });

      // Animate stat counters and text transitions
      stats.forEach((el, i) => {
        const span = el.querySelector('[data-to]');
        const target = span ? +span.dataset.to : 0;
        const pad = target < 10;
        const formatVal = (v) => {
          const r = Math.round(v);
          return pad ? String(r).padStart(2, '0') : String(r);
        };
        const counter = { v: 0 };

        if (i === 0 && span) {
          tl.to(
            counter,
            {
              v: target,
              duration: 0.7,
              ease: 'power1.out',
              onUpdate: () => (span.textContent = formatVal(counter.v)),
            },
            0.1
          );
        }

        if (i > 0) {
          const transTime = (i - 1) * stepDur + (stepDur - fadeDur * 0.75);

          tl.to(
            stats[i - 1],
            { opacity: 0, y: -25, duration: 0.45, ease: 'power1.in' },
            transTime
          );

          tl.fromTo(
            el,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power1.out' },
            transTime + 0.3
          );

          if (span) {
            tl.to(
              counter,
              {
                v: target,
                duration: 0.65,
                ease: 'power1.out',
                onUpdate: () => (span.textContent = formatVal(counter.v)),
              },
              transTime + 0.3
            );
          }
        }
      });

      // Hold the final stat
      tl.to({}, { duration: 1.0 });

      const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(pointer:coarse)').matches);

      ScrollTrigger.create({
        animation: tl,
        trigger: sec,
        start: 'top top',
        end: isMobile ? '+=1800' : '+=3400',
        pin: true,
        scrub: isMobile ? 0.6 : 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const activeIndex = Math.min(Math.floor(p * N), N - 1);
          setDot(activeIndex);
        },
      });

      // mouse parallax on the background layer
      if (window.matchMedia('(pointer:fine)').matches) {
        const qx = gsap.quickTo(bgsRef.current, 'x', { duration: 1.2, ease: 'power3' });
        const onMove = (e) => qx((e.clientX / window.innerWidth - 0.5) * -30);
        window.addEventListener('mousemove', onMove);
        offMove = () => window.removeEventListener('mousemove', onMove);
      }
    }, sec);

    return () => {
      offMove && offMove();
      ctx.revert();
    };
  }, []);

  return (
    <section className="community" id="community" ref={secRef}>
      <div className="comm-bgs" id="commBgs" ref={bgsRef}>
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`comm-bg-slide${i === 0 ? ' active' : ''}`}
            data-slide={i}
            aria-label={s.label}
          >
            <picture>
              <source media="(max-width: 768px)" srcSet={asset(`images/new/community_images/${s.mobile}.webp`)} />
              <img
                src={asset(`images/new/community_images/${s.desktop}.webp`)}
                alt={s.label}
                className="comm-bg-img"
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </picture>
          </div>
        ))}
      </div>

      <span className="artist-tag">Artist's Impression</span>

      <div className="container-xl">
        <div className="copy" id="copy">
          <p className="vc__eyebrow">THE BELLE VUE COMMUNITY</p>
          <h2>COME FOR THE VILLA. DISCOVER THE COMMUNITY.</h2>
          <p className="lead-sm">
            Your villa deserves a beautiful setting. And a thoughtfully planned, vibrant neighbourhood.
          </p>
          <p className="lead-sm">Discover Rustomjee Belle Vue in the hills of Kasara.</p>
          <a
            href="#enquire"
            className="btn-visit"
            onClick={(e) => {
              e.preventDefault();
              if (onBook) onBook(e.currentTarget);
              else scrollToId('#enquire');
            }}
          >
            Book a Site Visit <span>→</span>
          </a>
        </div>

        <div className="stats" id="stats">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              {s.to !== undefined && (
                <div className="num">
                  <span data-to={s.to}>{s.to < 10 ? String(s.to).padStart(2, '0') : '0'}</span>
                  {s.suffix && <small>{s.suffix}</small>}
                </div>
              )}
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="progress-dots" id="dots" ref={dotsRef}>
          <i></i><i></i><i></i><i></i><i></i>
        </div>
      </div>
    </section>
  );
}
