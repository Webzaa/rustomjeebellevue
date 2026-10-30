import { useEffect, useRef, useCallback, useState } from 'react';
import { gsap, ScrollTrigger, reduceMotion } from './lib/scroll.js';
import SmoothScroll from './components/SmoothScroll.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Experience from './components/Experience.jsx';
import Choices from './components/Choices.jsx';
import Community from './components/Community.jsx';
import Testimonials from './components/Testimonials.jsx';
import Location from './components/Location.jsx';
import ContactForm from './components/ContactForm.jsx';
import Footer from './components/Footer.jsx';
import BookingDialog from './components/BookingDialog.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsConditions from './components/TermsConditions.jsx';
import ThankYou from './components/ThankYou.jsx';
import { trackGtmPageView } from './utils/gtm.js';

const getRoute = () => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  if (
    hash === '#privacy' ||
    hash === '#/privacy' ||
    hash === '#privacypolicy' ||
    path.endsWith('/privacy-policy') ||
    path.endsWith('/privacy')
  ) {
    return 'privacy';
  }
  if (
    hash === '#terms' ||
    hash === '#/terms' ||
    hash === '#termsconditions' ||
    path.endsWith('/terms-conditions') ||
    path.endsWith('/terms')
  ) {
    return 'terms';
  }
  if (
    hash === '#thank-you' ||
    hash === '#thankyou' ||
    hash === '#/thank-you' ||
    hash === '#/thankyou' ||
    path.endsWith('/thank-you') ||
    path.endsWith('/thankyou')
  ) {
    return 'thankyou';
  }
  if (
    hash === '#oops' ||
    hash === '#/oops' ||
    hash === '#error' ||
    hash === '#/error' ||
    path.endsWith('/oops') ||
    path.endsWith('/error')
  ) {
    return 'oops';
  }
  return 'home';
};

export default function App() {
  const dialogRef = useRef(null);
  const enquireBarRef = useRef(null);
  const hasAutoPoppedRef = useRef(false);

  const openDialog = useCallback((from) => {
    hasAutoPoppedRef.current = true;
    dialogRef.current?.open(from);
  }, []);

  const [route, setRoute] = useState(getRoute);

  // Auto-open booking dialog form 30 seconds after page load (once per page load)
  useEffect(() => {
    if (route !== 'home') return;
    if (hasAutoPoppedRef.current) return;

    const timer = setTimeout(() => {
      if (!hasAutoPoppedRef.current) {
        hasAutoPoppedRef.current = true;
        dialogRef.current?.open();
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [route]);

  useEffect(() => {
    const onRoute = () => {
      setRoute(getRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onRoute);
    window.addEventListener('popstate', onRoute);
    return () => {
      window.removeEventListener('hashchange', onRoute);
      window.removeEventListener('popstate', onRoute);
    };
  }, []);

  // Track Google Tag Manager pageviews on every route change (home, thankyou, privacy, terms, oops)
  useEffect(() => {
    trackGtmPageView(route);
  }, [route]);

  // Show mobile enquire button only after scrolling past the home/hero view,
  // and hide it when reaching the enquiry/contact section and footer at the end.
  useEffect(() => {
    if (route !== 'home') return;

    const handleScroll = () => {
      const hero = document.getElementById('hero');
      const startThreshold = hero ? Math.min(hero.offsetHeight * 0.45, 260) : 200;
      const isPastHero = window.scrollY > startThreshold;

      const enquireSec = document.getElementById('enquire');
      const isAtEnd = enquireSec
        ? enquireSec.getBoundingClientRect().top < window.innerHeight * 0.75
        : (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 600);

      const shouldShow = isPastHero && !isAtEnd;
      enquireBarRef.current?.classList.toggle('is-visible', shouldShow);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [route]);

  // Runs after every child's effect, so all pinned sections already exist.
  useEffect(() => {
    if (route !== 'home') return;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (!window.location.hash || window.location.hash === '#top' || window.location.hash === '#home') {
      window.scrollTo(0, 0);
    }

    let ctx;
    if (!reduceMotion()) {
      ctx = gsap.context(() => {
        ScrollTrigger.batch('section:not(#hero):not(#experience):not(#community):not(#location) h2, .list li, .pick', {
          start: 'top 88%',
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { opacity: 0, y: 28 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', overwrite: true, clearProps: 'transform' }
            ),
        });
      });
    }
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      ctx && ctx.revert();
    };
  }, [route]);

  if (route === 'privacy') {
    return (
      <>
        <PrivacyPolicy onBook={openDialog} />
        <BookingDialog ref={dialogRef} />
      </>
    );
  }

  if (route === 'terms') {
    return (
      <>
        <TermsConditions onBook={openDialog} />
        <BookingDialog ref={dialogRef} />
      </>
    );
  }

  if (route === 'thankyou' || route === 'oops') {
    return (
      <>
        <ThankYou onBook={openDialog} isOops={route === 'oops'} />
        <BookingDialog ref={dialogRef} />
      </>
    );
  }

  return (
    <>
      <SmoothScroll />
      <a className="skip" href="#top">Skip to content</a>
      <Header onBook={openDialog} />
      <main id="top">
        <Hero />
        <Experience />
        <Choices onBook={openDialog} />
        <Community onBook={openDialog} />
        <Testimonials />
        <Location />
        <ContactForm />
      </main>
      <Footer />

      {/* Mobile Fixed Enquire Button with Animation */}
      <div className="mobile-enquire-bar" ref={enquireBarRef} aria-label="Quick Enquire">
        <button
          type="button"
          className="btn-mobile-enquire"
          onClick={(e) => openDialog(e.currentTarget)}
          aria-label="Enquire Now"
        >
          <span className="me-pulse" aria-hidden="true"></span>
          <span className="me-shimmer" aria-hidden="true"></span>
          <span className="me-icon" aria-hidden="true">✦</span>
          <span className="me-text">Enquire Now</span>
        </button>
      </div>

      <BookingDialog ref={dialogRef} />
    </>
  );
}
