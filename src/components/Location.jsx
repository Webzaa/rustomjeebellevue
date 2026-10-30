import { useEffect, useRef, useState } from 'react';
import { asset } from '../lib/assets.js';

const DIRECTIONS_URL = 'https://maps.app.goo.gl/Ruusw3WAqu7gubvr8';

const TABS = [
  { icon: 'loc01.png', label: 'Location Advantages & Expressways', id: 'Meet1' },
  { icon: 'loc02.png', label: 'Scenic Getaways Nearby', id: 'Meet2' },
  { icon: 'loc03.png', label: 'Upcoming Reputed Hotel Chains & Development', id: 'Meet3' },
];

const ADVANTAGES_L = ['Mumbai – 98 km', 'Thane – 79 km', 'Igatpuri – 22 km', 'JNPT–Virar Corridor', 'Samruddhi Mahamarg', 'Delhi–Baroda Expressway'];
const ADVANTAGES_R = ['Vadhavan Port Highway', 'Nashik – 68 km', 'Mumbai–Nashik Highway – 2 km', 'Kasara Railway Station – 2 km'];
const GETAWAYS_L = ['Igatpuri – 19.7 km', 'Ashoka Waterfall – 14.4 km', 'Kasara Ghat – 5.6 km', 'Bhatsa Dam – 27.1 km', 'Bhavali Dam – 32.5 km'];
const GETAWAYS_R = ['Tansa Dam – 36.9 km', 'Vaitarna Dam – 29.9 km', 'Mahuli Fort – 40.9 km', 'Manas Mandir – 37.9 km', 'Modaksagar Dam – 29.9 km'];
const HOTELS = [
  'Bhiwandi Logistic Park – 58 km',
  'Proposed Khardi MIDC – 18 km',
  'Mahindra Factory – 21 km',
  'Proposed Igatpuri MIDC – 36 km',
  'Proposed ITC Hotel – 25 km',
  'Proposed Hyatt Hotel – 35 km',
];

const List = ({ items }) => (
  <ul className="locationList">
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

export default function Location() {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const [mapOn, setMapOn] = useState(false);
  const mapRef = useRef(null);
  const tabRowRef = useRef(null);

  useEffect(() => {
    const el = mapRef.current;
    if (!('IntersectionObserver' in window)) return setMapOn(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMapOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (i, btn) => {
    setActive(i);
    setShown(-1);
    setTimeout(() => setShown(i), 20);
    const row = tabRowRef.current;
    const rr = row.getBoundingClientRect();
    const tr = btn.getBoundingClientRect();
    if (tr.left < rr.left || tr.right > rr.right) {
      row.scrollTo({
        left: row.scrollLeft + (tr.left - rr.left) - (rr.width - tr.width) / 2,
        behavior: 'smooth',
      });
    }
  };

  const paneCls = (i) => `tab-pane fade${active === i ? ' active' : ''}${shown === i ? ' show' : ''}`;

  return (
    <section id="location" data-log="location_section">
      <div className="innerlocation">
        <div className="container">
          <div className="position-relative">
            <div className="row">
              <div className="col-xl-6 col-lg-6 col-md-12 col-12 order-lg-0 order-1" data-log="location_left_panel">
                <div className="location-header">
                  <p className="vc__eyebrow">LOCATION</p>
                  <h2 className="rt">
                    KASARA HILLS.<br />
                    <span className="loc-nowrap">MADE FOR WEEKENDS.</span>
                  </h2>
                  <p className="loc-lead">
                    Surrounded by the scenic Sahyadri ranges, approximately 1,000 feet above sea level.
                  </p>
                  <p className="loc-sub">
                    Discover a setting that invites you to slow down, reconnect and enjoy life closer to nature.
                  </p>
                </div>
                <div className="scroll-container" data-log="location_tabs_container">
                  <ul className="scroll-content nav nav-tabs anim" id="myTabMeet" role="tablist" ref={tabRowRef}>
                    {TABS.map((t, i) => (
                      <li className="nav-item" role="presentation" key={t.id}>
                        <button className={`nav-link${active === i ? ' active' : ''}`} id={`${t.id}-tab`} type="button" role="tab" aria-controls={t.id} aria-selected={active === i} onClick={(e) => pick(i, e.currentTarget)}>
                          <span>
                            <img src={asset(`images/new/location/${t.icon}`)} alt="" className="location-icon" />
                          </span>
                          {t.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="tab-content anim" id="myTabMeetContent">
                    <div className={paneCls(0)} id="Meet1" role="tabpanel" aria-labelledby="Meet1-tab">
                      <div className="row">
                        <div className="col-lg-6"><List items={ADVANTAGES_L} /></div>
                        <div className="col-lg-6"><List items={ADVANTAGES_R} /></div>
                      </div>
                    </div>
                    <div className={paneCls(1)} id="Meet2" role="tabpanel" aria-labelledby="Meet2-tab">
                      <div className="row">
                        <div className="col-lg-6"><List items={GETAWAYS_L} /></div>
                        <div className="col-lg-6"><List items={GETAWAYS_R} /></div>
                      </div>
                    </div>
                    <div className={paneCls(2)} id="Meet3" role="tabpanel" aria-labelledby="Meet3-tab">
                      <List items={HOTELS} />
                    </div>
                  </div>
                </div>
                 <div className="get-directions-wrap">
                    <a href={DIRECTIONS_URL} target="_blank"
                      rel="noopener noreferrer"
                      className="get-directions-btn"
                      data-log="location_get_directions">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Get Directions
                    </a>
                  </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-12 col-12 order-lg-1 order-0" data-log="location_right_panel">
                <div className="mobilemap">
                  <div className={`map-image circle_animation${mapOn ? ' active' : ''}`} ref={mapRef}>
                    <img src={asset('images/new/location/Location-Map.png')} alt="map image" />
                    <div className="map-marker">
                      <img src={asset('images/new/location/rustomjee-location.svg')} alt="" />
                      <div className="pulse"></div>
                    </div>
                  </div>                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}