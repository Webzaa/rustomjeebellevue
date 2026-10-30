import { useEffect, useState } from 'react';
import Header from './Header.jsx';

export default function ThankYou({ onBook, isOops: isOopsProp = false }) {
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const hash = (typeof window !== 'undefined' ? window.location.hash : '').toLowerCase();
    const search = (typeof window !== 'undefined' ? window.location.search : '').toLowerCase();
    const storedStatus = typeof window !== 'undefined' ? sessionStorage.getItem('form_submission_status') : null;
    const storedError = typeof window !== 'undefined' ? sessionStorage.getItem('form_error_msg') : '';

    if (storedError) setErrorMsg(storedError);

    // Explicit preview flags for developer/client testing
    if (hash.includes('preview=oops') || search.includes('preview=oops') || hash.includes('state=oops')) {
      setStatus('oops');
      return;
    }
    if (hash.includes('preview=thankyou') || search.includes('preview=thankyou') || hash.includes('state=success')) {
      setStatus('success');
      return;
    }

    // Direct oops routes
    if (
      isOopsProp ||
      hash === '#oops' ||
      hash === '#/oops' ||
      hash === '#error' ||
      hash === '#/error'
    ) {
      setStatus('oops');
      return;
    }

    // Check if form was actually submitted successfully
    if (storedStatus === 'success') {
      setStatus('success');
    } else {
      // If form was NOT submitted (e.g. direct access without submit, or submission failed)
      setStatus('oops');
    }
  }, [isOopsProp]);

  const goHome = () => {
    window.location.hash = '';
    window.scrollTo(0, 0);
  };

  const handleTryAgain = () => {
    window.location.hash = '';
    window.scrollTo(0, 0);
    setTimeout(() => {
      const contactSection = document.getElementById('contact') || document.getElementById('enquire');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const isOops = status === 'oops';

  return (
    <div className={`thankyou-page ${isOops ? 'thankyou-page--oops' : ''}`}>
      <Header onBook={onBook} backButton />
      <main className="thankyou-content">
        <div className={`thankyou-card ${isOops ? 'thankyou-card--oops' : ''}`}>
          <div className={`ty-badge-wrap ${isOops ? 'ty-badge-wrap--oops' : ''}`}>
            {isOops ? (
              <span className="ty-sparkle ty-sparkle--oops" aria-hidden="true">!</span>
            ) : (
              <span className="ty-sparkle" aria-hidden="true">✦</span>
            )}
          </div>

          <p className={`ty-eyebrow ${isOops ? 'ty-eyebrow--oops' : ''}`}>
            {isOops ? 'SUBMISSION NOT COMPLETED' : 'ENQUIRY RECEIVED'}
          </p>

          <h1 className={`ty-title ${isOops ? 'ty-title--oops' : ''}`}>
            {isOops ? 'OOPS!' : 'THANK YOU!'}
          </h1>

          <p className="ty-lead">
            {isOops
              ? (errorMsg || 'Your enquiry could not be submitted. Please fill out the form or try again.')
              : 'Your interest in Villa Altura has been successfully registered.'}
          </p>

          <p className="ty-desc">
            {isOops
              ? 'We apologize for the inconvenience. Please try submitting the enquiry form again, or click below to return to the site.'
              : 'Our private client advisory team will reach out to you shortly to schedule your personalized villa walkthrough.'}
          </p>

          <div className="ty-divider" aria-hidden="true" />

          <div className="ty-actions ty-actions--double">
            {isOops ? (
              <>
                <button type="button" className="btn ty-btn ty-btn--primary" onClick={handleTryAgain}>
                  Fill Form Again
                </button>
                <button type="button" className="btn ty-btn ty-btn--secondary" onClick={goHome}>
                  Return to Home
                </button>
              </>
            ) : (
              <button type="button" className="btn ty-btn" onClick={goHome}>
                ← Return to Home
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
