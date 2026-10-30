import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reduceMotion } from '../lib/scroll.js';
import { asset } from '../lib/assets.js';

const STORIES = [
  {
    key: 'singh',
    name: 'Mr. & Mrs. Singh',
    video: asset('images/new/testimonial/Singh.mp4'),
    thumb: asset('images/new/testimonial/singh.webp'),
    length: '0:59',
    quote:
      'When we saw the natural surroundings and peaceful vibe, we instantly felt connected. Being non-Mumbai residents, trust in the developer mattered most and Rustomjee gave us that confidence. The waterfall, valley views, and secure gated community made it an easy decision. We truly believe this investment will benefit both us and the next generation.',
  },
  {
    key: 'nair',
    name: 'Mr. & Mrs. Nair',
    video: asset('images/new/testimonial/nair.mp4'),
    thumb: asset('images/new/testimonial/nair.webp'),
    length: '0:51',
    quote:
      'The first thing that stood out to us was the tranquility and serenity of the place. It’s perfect for spending quality weekends with family, away from the city. With easy connectivity from Mumbai, along with amenities like the clubhouse and beautifully designed nature trails, it offers the ideal balance of recreation and peace.',
  },
  {
    key: 'anthwal',
    name: 'Mr. & Mrs. Anthwal',
    video: asset('images/new/testimonial/anthwal.mp4'),
    thumb: asset('images/new/testimonial/anthwal.webp'),
    length: '0:43',
    quote:
      'My wife and I have always loved travelling, and every time we passed through the Kasara hills, we dreamed of having a home here someday. The lush green valleys and peaceful surroundings stayed with us. With its excellent connectivity just a short drive from Mumbai this felt like the perfect place to turn that dream into reality.',
  },
];

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function Testimonials() {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const currRef = useRef(0);
  const animatingRef = useRef(false);
  const touchRef = useRef({ x: 0, y: 0 });
  const countRef = useRef(null);

  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(null);

  /* ---- counter in heading ---- */
  useEffect(() => {
    if (reduceMotion()) return;
    const el = countRef.current;
    const o = { v: 0 };
    const trig = gsap.to(o, {
      v: 320,
      duration: 1.6,
      ease: 'power2.out',
      paused: true,
      onUpdate: () => (el.textContent = Math.round(o.v)),
      onComplete: () => (el.textContent = 320),
    });
    const st = ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => trig.play() });
    return () => {
      trig.kill();
      st.kill();
    };
  }, []);

  /* ---- stack setup + container height sync ---- */
  useEffect(() => {
    const cards = cardRefs.current;
    cards.forEach((card, i) => {
      const vCard = card.querySelector('.t-video-card');
      card.classList.toggle('active', i === 0);
      card.style.visibility = i === 0 ? 'visible' : 'hidden';
      card.style.pointerEvents = i === 0 ? 'auto' : 'none';
      gsap.set(card, { position: 'absolute', zIndex: i === 0 ? 3 : 1 });
      if (vCard) gsap.set(vCard, { clipPath: 'inset(0% 0% 0% 0%)' });
    });

    const sync = () => {
      let maxH = 0;
      cards.forEach((c) => (maxH = Math.max(maxH, c.offsetHeight)));
      if (maxH > 100) stageRef.current.style.minHeight = maxH + 'px';
    };
    sync();
    const t = setTimeout(sync, 400);
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', sync);
      window.removeEventListener('load', sync);
    };
  }, []);

  /* ---- transition between stories ---- */
  const goTo = useCallback((nextIdx, dir) => {
    const cards = cardRefs.current;
    const curr = currRef.current;
    if (animatingRef.current || nextIdx === curr || nextIdx < 0 || nextIdx >= cards.length) return;
    animatingRef.current = true;

    const currCard = cards[curr];
    const nextCard = cards[nextIdx];

    setPlaying(null);
    setPage(nextIdx);

    const hide = (c) => {
      c.classList.remove('active');
      c.style.visibility = 'hidden';
      c.style.pointerEvents = 'none';
    };
    const show = (c) => {
      c.classList.add('active');
      c.style.visibility = 'visible';
      c.style.pointerEvents = 'auto';
    };

    if (reduceMotion()) {
      hide(currCard);
      show(nextCard);
      currRef.current = nextIdx;
      animatingRef.current = false;
      return;
    }

    const currVideoCard = currCard.querySelector('.t-video-card');
    const nextVideoCard = nextCard.querySelector('.t-video-card');
    const currImg = currCard.querySelector('.video-preview img');
    const nextImg = nextCard.querySelector('.video-preview img');
    const currQuote = currCard.querySelector('.t-quote-card');
    const nextQuote = nextCard.querySelector('.t-quote-card');

    const fwd = dir >= 0;
    const s = fwd ? 1 : -1;

    gsap.set(currCard, { zIndex: 4 });
    gsap.set(nextCard, { zIndex: 5 });
    gsap.set(nextVideoCard, { clipPath: fwd ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' });
    gsap.set(nextImg, { scale: 1.18, x: 35 * s });
    gsap.set(nextQuote, { opacity: 0, x: 25 * s });

    show(nextCard);

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        hide(currCard);
        gsap.set(currCard, { zIndex: 1 });
        gsap.set(currVideoCard, { clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(currImg, { scale: 1, x: 0 });
        gsap.set(currQuote, { opacity: 1, x: 0 });
        gsap.set(nextCard, { zIndex: 3 });
        currRef.current = nextIdx;
        animatingRef.current = false;
      },
    });

    tl.to(nextVideoCard, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.85 }, 0)
      .to(nextImg, { scale: 1, x: 0, duration: 0.95, ease: 'power3.out' }, fwd ? 0.05 : 0)
      .to(currImg, { scale: 1.05, x: -25 * s, duration: 0.85 }, 0)
      .to(currQuote, { opacity: 0, x: -25 * s, duration: 0.45, ease: 'power2.in' }, 0)
      .to(nextQuote, { opacity: 1, x: 0, duration: 0.65, ease: 'power2.out' }, 0.25);
  }, []);

  const next = () => goTo((currRef.current + 1) % STORIES.length, 1);
  const prev = () => goTo((currRef.current - 1 + STORIES.length) % STORIES.length, -1);

  const onTouchStart = (e) => {
    touchRef.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
  };

  return (
    <section className="sec b testimonials-sec" id="testimonials">
      <div id="confidence" style={{ position: 'absolute', top: 0 }}></div>
      <div className="wrap">
        <div className="sec-head-center">
          <p className="vc__eyebrow">CUSTOMER CONFIDENCE</p>
          <h2>
            <span className="trust-num">
              <span ref={countRef}>320</span>+
            </span>{' '}
            CUSTOMERS. ONE GROWING COMMUNITY.
          </h2>
          <p style={{ marginTop: 14, maxWidth: '72ch', marginLeft: 'auto', marginRight: 'auto' }}>
            Different dreams. One shared belief in Belle Vue. Now, discover your own retreat at Villa Altura.
          </p>
        </div>
        <div className="testimonials-showcase-box">
          <div className="df-sticky-container" id="testimonialStage" ref={stageRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {STORIES.map((s, i) => (
              <article className="t-showcase-row df-sticky-card" data-index={i} key={s.key} ref={(el) => (cardRefs.current[i] = el)}>
                <div className="t-video-card">
                  <div className="video-preview" data-story={s.key} style={{ display: playing === i ? 'none' : undefined }} onClick={() => setPlaying(i)}>
                    <img src={s.thumb} alt={`${s.name} testimonial video thumbnail`} width="1376" height="768" loading="lazy" />
                    <div className="t-video-scrim"></div>
                    <div className="t-top-badge">
                      <span className="badge-verified">✦ Verified Homeowner</span>
                    </div>
                    <button className="t-play-big" type="button" aria-label={`Play ${s.name} testimonial video`}>
                      <span className="t-play-icon" aria-hidden="true">▶</span>
                    </button>
                    <div className="t-bottom-overlay">
                      <span className="t-fam-tag">FAMILY STORY</span>
                      <h3 className="t-fam-name">{s.name}</h3>
                      <div className="t-watch-row">
                        <span className="t-watch-circle" aria-hidden="true">▶</span>
                        <span className="t-watch-label">Watch Story · {s.length} min</span>
                        <span className="t-watch-bar"></span>
                      </div>
                    </div>
                  </div>
                  <div className="user-video-slot" style={{ display: playing === i ? 'block' : 'none' }}>
                    {playing === i && (
                      <>
                        <video src={s.video} controls autoPlay playsInline />
                        <button className="t-video-close-btn" type="button" aria-label="Close video" title="Close video" onClick={(e) => { e.stopPropagation(); setPlaying(null); }}>✕ </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="t-quote-card">
                  <div className="t-giant-quote" aria-hidden="true">“</div>
                  <blockquote className="t-quote-text">{s.quote}</blockquote>
                  <div className="t-quote-divider"></div>
                  <div className="t-quote-author">{s.name}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="t-controls-bar">
            <div className="t-controls-row">
              <button className="t-nav-arrow t-prev-btn" aria-label="Previous story" type="button" onClick={prev}>
                <ChevronLeft />
              </button>
              <div className="t-nav-indicator">
                <span className="t-curr-page">{'0' + (page + 1)}</span>
                <span className="t-slash-sep">/</span>
                <span className="t-total-page">0{STORIES.length}</span>
              </div>
              <button className="t-nav-arrow t-next-btn" aria-label="Next story" type="button" onClick={next}>
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
