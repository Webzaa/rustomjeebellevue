import { useEffect, useRef } from 'react';
import { gsap, scrollToId, reduceMotion } from '../lib/scroll.js';
import { asset } from '../lib/assets.js';

const VILLAS = [
  {
    img: asset('images/new/bedroom.jpg'),
    alt: '3.5 BHK Villa with Private Pool at Villa Altura',
    bhk: '3.5',
    title: '3.5 BHK Villa',
    features: ['Three bedrooms', 'Living, dining and kitchen', 'Family room', 'Two open terrace areas', 'Car parking'],
    extraCta: 'Explore Villa Floor Plans',
    cta: 'View 3.5 BHK Plan',
  },
  {
    img: asset('images/new/overview.webp'),
    alt: '4.5 BHK Villa with Private Pool at Villa Altura',
    bhk: '4.5',
    title: '4.5 BHK Villa',
    features: ['Four bedrooms', 'Living, dining and kitchen', 'Family room', 'Front open terrace', 'Car parking'],
    extraCta: 'Explore Villa Floor Plans',
    cta: 'View 4.5 BHK Plan',
  },
];

export default function Choices({ onBook }) {
  const secRef = useRef(null);

  const handleCta = (e) => {
    e.preventDefault();
    if (onBook) onBook(e.currentTarget);
    else scrollToId('#enquire');
  };

  useEffect(() => {
    if (reduceMotion()) return;
    const sec = secRef.current;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => {
      const head = sec.querySelector('.vc__head');
      const row = sec.querySelector('.vc__row');
      const cards = gsap.utils.toArray('.vc__card', sec);
      const captions = gsap.utils.toArray('.vc__caption', sec);
      const foot = sec.querySelector('.vc__foot');
      if (!head || !row || cards.length < 2) return;

      const headToCentre = () => sec.offsetHeight / 2 - (head.offsetTop + head.offsetHeight / 2);
      const toCentre = (i, el) => row.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);

      gsap.set(cards[0], { zIndex: 2 });
      gsap.set(cards[1], { zIndex: 1 });
      if (foot) gsap.set(foot, { autoAlpha: 0, y: 12 });

      const tl = gsap
        .timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: sec,
            start: 'top top',
            end: '+=290%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .set(head, { y: headToCentre }, 0)
        .set(cards, { autoAlpha: 0, x: toCentre, y: () => window.innerHeight * 0.5 }, 0)
        .to({}, { duration: 0.1 }, 0)
        .to(head, { y: 0, duration: 0.25 }, 0.1)
        .to(cards, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power3.out' }, 0.3)
        .to({}, { duration: 0.08 }, 0.55)
        .to(cards, { x: 0, duration: 0.35, ease: 'power3.inOut' }, 0.63)
        .fromTo(captions, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'none' }, 0.92);

      if (foot) {
        tl.to(foot, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'none' }, 0.92);
      }

      tl.to({}, { duration: 0.08 });
    });

    mm.add('(max-width: 991.98px) and (prefers-reduced-motion: no-preference)', () => {
      const items = gsap.utils.toArray('.vc__item', sec);
      if (items.length < 2) return;

      items.forEach((item, i) => {
        gsap.set(item, { zIndex: i + 1 });
        if (i > 0) {
          gsap.set(item, { yPercent: 120, autoAlpha: 1 });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top 64px',
          end: '+=950',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to({}, { duration: 0.25 });
      tl.to(items[0], { scale: 0.93, opacity: 0.45, duration: 1, ease: 'power2.inOut' }, 0.25);
      tl.to(items[1], { yPercent: 0, duration: 1, ease: 'power2.inOut' }, 0.25);
      tl.to({}, { duration: 0.4 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="vc" id="choices" ref={secRef} aria-labelledby="vc-heading">
      <div id="plans" style={{ position: 'absolute', top: 0 }}></div>
      <div className="vc__head">
        <p className="vc__eyebrow">VILLA CHOICES &amp; FLOOR PLANS</p>
        <h2 className="rt" id="vc-heading">TWO WAYS TO LIVE IN THE HILLS.</h2>
        <p className="vc__lead">Both designed for family time, privacy and your own outdoor space.</p>
      </div>

      <ul className="vc__row">
        {VILLAS.map((v) => (
          <li className="vc__item" key={v.title}>
            <article className="vc__card">
              <img src={v.img} alt={v.alt} loading="lazy" />
              <span className="artist-tag">Artist's Impression</span>
              <div className="vc__caption">
                <h3><span className="num-font">{v.bhk}</span> BHK Villa</h3>
                <p className="vc__tagline">Private pool, deck and landscaped garden</p>
                <ul className="vc__features">
                  {v.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {v.extraCta && <p className="vc__explore">{v.extraCta}</p>}
                <a href="#enquire" className="vc__btn" onClick={handleCta}>
                  {v.cta}
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="vc__foot">
        <p className="vc__choose">Choose the extra terrace space or the extra bedroom.</p>
        <p className="vc__note">Room schedules are indicative; approved plans and specifications prevail.</p>
      </div>
    </section>
  );
}