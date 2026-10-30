import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger, reduceMotion } from '../lib/scroll.js';
import { asset } from '../lib/assets.js';

const MOBILE_QUERY = '(max-width: 768px)';
const VIDEO_DESKTOP = 'videos/deskvid_scrub1_scrub.mp4';
const VIDEO_MOBILE = 'videos/mobvid_scrub.mp4';
const POSTER_DESKTOP = 'videos/preloderdeskvid.webp';
const POSTER_MOBILE = 'videos/preloadermobvid.webp';

const CHAPTERS = [
  { text: 'A terrace made for\nevenings in the hills.', pos: 'left-bottom', a: 0.17, b: 0.22, c: 0.32, d: 0.38 },
  { text: 'A private pool for\nunhurried days.', pos: 'right-bottom', a: 0.37, b: 0.42, c: 0.52, d: 0.58 },
  { text: 'A family room for\nmoments together.', pos: 'left-bottom', a: 0.57, b: 0.62, c: 0.72, d: 0.78 },
  { text: 'Living spaces that open\nto your own garden.', pos: 'right-bottom', a: 0.77, b: 0.82, c: 0.9, d: 0.94 },
  { text: 'Space to enjoy life\nat your own pace.', pos: 'left-bottom', a: 0.93, b: 0.96, c: 1.1, d: 1.1 },
];

const fade = (p, a, b, c, d) =>
  p < a ? 0 : p < b ? (p - a) / (b - a || 1) : p < c ? 1 : p < d ? 1 - (p - c) / (d - c) : 0;

export default function Experience() {
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const chRefs = useRef([]);
  const cueRef = useRef(null);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    const stage = stageRef.current;
    if (!v || !stage) return;

    const coarse = window.matchMedia('(pointer:coarse)').matches || window.innerWidth < 768;

    if (chRefs.current[0]) chRefs.current[0].style.opacity = 1;
    if (reduceMotion()) return;

    let dur = 0;
    let target = 0;
    let queued = false;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      v.preload = 'auto';
      v.src = asset(isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP);
      v.load();
    };

    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            start();
            io.disconnect();
          }
        },
        { rootMargin: '200% 0px' }
      );
      io.observe(stage);
    } else {
      start();
    }

    const seek = () => {
      if (!dur || v.readyState < 1) return;
      if (v.seeking) { queued = true; return; }
      const t = Math.min(Math.max(target, 0), dur - 0.04);
      if (Math.abs(v.currentTime - t) > 0.012) v.currentTime = t;
    };

    const onSeeked = () => {
      if (queued) { queued = false; seek(); }
    };

    const onMeta = () => {
      dur = Number.isFinite(v.duration) && v.duration > 1 ? v.duration : 0;
      seek();
    };

    v.addEventListener('seeked', onSeeked);
    v.addEventListener('loadedmetadata', onMeta);
    if (v.readyState >= 1) onMeta();

    const prime = () => {
      const p = v.play();
      if (p && p.then) {
        p.then(() => { v.pause(); seek(); }).catch(() => {});
      }
    };
    const onTouch = () => { if (started) prime(); };
    if (coarse) {
      v.addEventListener('loadeddata', prime, { once: true });
      document.addEventListener('touchstart', onTouch, { once: true, passive: true });
    }

    const last = CHAPTERS.map(() => -1);
    let lastCue = -1;

    const apply = (p) => {
      target = p * dur;
      seek();

      CHAPTERS.forEach((c, i) => {
        const o = Math.round(fade(p, c.a, c.b, c.c, c.d) * 100) / 100;
        if (o === last[i]) return;
        last[i] = o;
        const el = chRefs.current[i];
        if (!el) return;
        el.style.opacity = o;
        el.style.visibility = o > 0 ? 'visible' : 'hidden';
        if (el.firstElementChild) {
          el.firstElementChild.style.transform = `translate3d(0, ${((1 - o) * 24).toFixed(1)}px, 0)`;
        }
      });

      if (cueRef.current) {
        const c = Math.round(Math.max(0, 1 - p / 0.04) * 100) / 100;
        if (c !== lastCue) { lastCue = c; cueRef.current.style.opacity = c; }
      }
    };

    const st = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: () => '+=' + window.innerHeight * (coarse ? 5 : 9),
      pin: true,
      scrub: coarse ? 0.5 : 0.35,
      invalidateOnRefresh: true,
      refreshPriority: 1,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });

    ScrollTrigger.sort();
    apply(0);

    return () => {
      st.kill();
      io && io.disconnect();
      v.removeEventListener('seeked', onSeeked);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('loadeddata', prime);
      document.removeEventListener('touchstart', onTouch);
    };
  }, [isMobile]);

  return (
    <section id="experience">
      <div id="villa" style={{ position: 'absolute', top: 0 }}></div>
      <div className="sec-head-center1">
      {/* <p className="vc__eyebrow">THE VILLA EXPERIENCE</p> */}
        <h2>YOUR VILLA IN THE HILLS.</h2>
      </div>

      <div className="film-stage" ref={stageRef}>
        <video key={isMobile ? 'mobile' : 'desktop'} ref={videoRef} poster={asset(isMobile ? POSTER_MOBILE : POSTER_DESKTOP)}
          muted playsInline webkit-playsinline="true" preload="none" disablePictureInPicture disableRemotePlayback aria-label="Walkthrough film of Villa Altura" />
        <div className="film-scrim"></div>
        <span className="artist-tag">AI-Generated</span>

        {CHAPTERS.map((c, i) => (
          <div
            className={`f-ch f-ch--${c.pos || 'center'}`}
            key={c.text}
            ref={(el) => (chRefs.current[i] = el)}
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <div className="f-ch-body">
              <span className="f-ch-title f-ch-title--point">
                {c.text.split('\n').map((line, idx) => (
                  <span key={idx} className="f-ch-line">{line}</span>
                ))}
              </span>
            </div>
          </div>
        ))}

        <div className="film-cue" ref={cueRef} aria-hidden="true">
          <em>Scroll to Explore</em>
          <i></i>
        </div>
      </div>
    </section>
  );
}
