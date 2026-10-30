import { asset } from '../lib/assets.js';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="ft-top">
          <h3 className="ft-main-heading">VILLA ALTURA AT RUSTOMJEE BELLE VUE, KASARA</h3>
          <div className="ft-top-row">
            <div className="ft-top-rera">
              <div className="ft-qr-wrap">
                <img src={asset('images/new/QR-Code.webp')} className="ft-qr-img" alt="MahaRERA QR Code" />
              </div>
              <div className="ft-top-rera-text">
                <p className="ft-rera-reg">MahaRERA Registration No. P51700077224</p>
                <a
                  href="https://maharera.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-rera-link"
                >
                  https://maharera.maharashtra.gov.in
                </a>
              </div>
            </div>

            <div className="ft-top-divider" aria-hidden="true" />

            <div className="ft-top-address">
              <h4 className="ft-address-title">Site Address:</h4>
              <p className="ft-address-line">
                Rustomjee Belle Vue, Village Mokhavane, Taluka-Shahapur, Kasara,
                <br />
                Maharashtra - 421602, India.
              </p>
            </div>
          </div>
        </div>

        <div className="disclaimer">
          <p> <strong>Disclaimer : </strong>
            Artist’s impressions are illustrative. Plans, specifications, landscaped areas and amenities are
            indicative and subject to approved plans and applicable contractual documents. This landing page is not an
            offer or contract. Construction of the villas shall be undertaken by contractors certified by Rustomjee and
            in accordance with the project’s prescribed architectural, design and development guidelines.
          </p>
        </div>

        <div className="ft-bottom">
          <div className="ft-bottom-partner">
            Digital Marketing Partner : SSV Technologies
          </div>
          <div className="ft-bottom-copy">
            Copyright &copy; 2026 All rights reserved
          </div>
          <div className="ft-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <span className="ft-bottom-sep">|</span>
            <a href="#terms">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
