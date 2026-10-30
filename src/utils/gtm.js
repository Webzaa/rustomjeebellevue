/**
 * Google Tag Manager SPA Helper
 * Tracks virtual pageviews and custom events across all routes:
 * Home, Thank You (#thank-you), Privacy Policy (#privacy), Terms (#terms), Oops (#oops)
 */

export const trackGtmPageView = (route) => {
  if (typeof window === 'undefined') return;

  let pageTitle = 'Rustomjee Belle Vue, Kasara | 3.5 & 4.5 BHK Villas with Private Pool';
  let pagePath = '/';

  switch (route) {
    case 'thankyou':
      pageTitle = 'Thank You | Rustomjee Belle Vue, Kasara';
      pagePath = '/thank-you';
      break;
    case 'privacy':
      pageTitle = 'Privacy Policy | Rustomjee Belle Vue, Kasara';
      pagePath = '/privacy-policy';
      break;
    case 'terms':
      pageTitle = 'Terms & Conditions | Rustomjee Belle Vue, Kasara';
      pagePath = '/terms-conditions';
      break;
    case 'oops':
      pageTitle = 'Submission Incomplete | Rustomjee Belle Vue, Kasara';
      pagePath = '/oops';
      break;
    default:
      pageTitle = 'Rustomjee Belle Vue, Kasara | 3.5 & 4.5 BHK Villas with Private Pool';
      pagePath = '/';
  }

  document.title = pageTitle;

  window.dataLayer = window.dataLayer || [];

  // 1. Standard GA4 page_view
  window.dataLayer.push({
    event: 'page_view',
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: pagePath,
    page_route: route,
  });

  // 2. GTM SPA virtual pageview (standard for marketing agencies)
  window.dataLayer.push({
    event: 'virtualPageview',
    pageTitle: pageTitle,
    pageUrl: window.location.href,
    pagePath: pagePath,
  });

  // 3. Thank you conversion triggers for Google Ads / Meta / Marketing
  if (route === 'thankyou') {
    window.dataLayer.push({
      event: 'thankyou_page_view',
      event_category: 'Lead',
      event_label: 'Villa Altura Kasara',
      page_path: '/thank-you',
      page_title: pageTitle,
    });
    window.dataLayer.push({
      event: 'lead_conversion',
      page_path: '/thank-you',
    });
  }
};

export const pushGtmEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });
};
