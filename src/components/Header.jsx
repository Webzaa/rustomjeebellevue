import { useEffect, useRef, useState } from 'react';
import { scrollToId, stopSmoothScroll, startSmoothScroll } from '../lib/scroll.js';
import { asset } from '../lib/assets.js';

const NAV_ITEMS = [
  { href: '#home', num: '', title: 'Home', img: 'images/new/overview.webp' },
  { href: '#villa', num: '', title: 'The Villa Experience', img: 'images/new/overview.webp' },
  { href: '#plans', num: '', title: 'Villa Choices & Floor Plans', img: 'images/new/overview.webp' },
  { href: '#community', num: '', title: 'The Belle Vue Community', img: 'images/new/overview.webp' },
  { href: '#confidence', num: '', title: 'Customer Confidence', img: 'images/new/overview.webp' },
  { href: '#location', num: '', title: 'Location', img: 'images/new/overview.webp' },
];

export default function Header({ onBook, backButton = false }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeImg, setActiveImg] = useState('images/new/overview.webp');
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const setMenu = (o) => {
    setOpen(o);
    if (o) {
      document.documentElement.style.overflow = 'hidden';
      stopSmoothScroll();
    } else {
      document.documentElement.style.overflow = '';
      startSmoothScroll();
    }
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setMenu(false);
    const hash = window.location.hash.toLowerCase();
    if (
      hash === '#privacy' ||
      hash === '#terms' ||
      hash === '#thank-you' ||
      hash === '#thankyou' ||
      hash === '#oops' ||
      hash === '#error'
    ) {
      window.location.hash = href === '#top' ? '' : href;
      return;
    }
    scrollToId(href);
  };

  const handleBack = () => {
    window.location.hash = '';
    window.scrollTo(0, 0);
  };

  return (
    <header id="hdr" className={`${solid || backButton ? 'solid' : ''} ${open ? 'menu-open' : ''}`}>
      <a aria-label="Villa Altura home" className="logo" href="#top" onClick={(e) => go(e, '#top')}>
        <img src={asset('images/new/bellevue-logo.png')} className="img-fluid" alt="Villa Altura" />
      </a>

      {backButton ? (
        <button
          className="btn-header-back"
          type="button"
          onClick={handleBack}
          aria-label="Back to home"
        >
          <span className="back-arrow" aria-hidden="true">←</span>
          <span>Back</span>
        </button>
      ) : (
        <>
          <div className="header-actions">
            <button
              type="button"
              className="btn-header-book"
              onClick={(e) => onBook && onBook(e.currentTarget)}
              aria-label="Book a Site Visit"
            >
              <span>Book a Site Visit</span>
            </button>
            <button
              aria-controls="nav"
              aria-expanded={open}
              className="menu"
              id="menuBtn"
              type="button"
              onClick={() => setMenu(!open)}
            >
              <i className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} aria-hidden="true"></i>
            </button>
          </div>
          <nav id="nav" ref={navRef} className={open ? 'open' : ''} aria-label="Main">
            <div className="mnav">
              <div className="row gx-5 align-items-center">
                <div className="col-lg-7">
                  <div className="mi">
                    {NAV_ITEMS.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => go(e, item.href)}
                        onMouseEnter={() => item.img && setActiveImg(item.img)}
                      >
                        <span className="n">{item.num}</span>
                        <span>{item.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
                <div className="col-lg-5 d-none d-lg-block">
                  <figure className="mimg">
                    <img
                      id="mimg"
                      alt=""
                      width="1280"
                      height="853"
                      src={asset(activeImg)}
                    />
                    <span className="artist-tag">Artist's Impression</span>
                  </figure>
                </div>
              </div>
              <div className="mfoot">
                <a
                  className="btn"
                  href="#enquire"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenu(false);
                    onBook?.(e.currentTarget);
                  }}
                >
                  Book a Site Visit
                </a>
                <span>MahaRERA No. P51700077224</span>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
