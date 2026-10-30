import { useEffect } from 'react';
import Header from './Header.jsx';

export default function TermsConditions({ onBook }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <Header onBook={onBook} backButton />
      <main className="legal-content">
        <div className="legal-container">
          <h1>TERMS AND CONDITIONS</h1>
          <p>
            We request you to familiarize yourself with the terms and conditions set out below before navigating further or viewing our website:
          </p>

          <h2>GENERIC DETAILS REGARDING THE WEBSITE</h2>
          <p>
            <a href="https://www.rustomjee.com" target="_blank" rel="noopener noreferrer">www.rustomjee.com</a> is the corporate website operated by Keystone Realtors Private Limited and its group companies (that is, its affiliates, subsidiaries, ultimate holding company and its subsidiaries) (&ldquo;Rustomjee Group&rdquo;).
          </p>
          <p>
            By proceeding to view our website or part thereof or any specific project related detail as disclosed on this website, you acknowledge that you have read, understood and accepted these terms which shall constitute the entire binding agreement between you and the Rustomjee Group. We may revise these terms at any time by amending this page. Please check this page from time to time to take notice of any changes we make, as they are binding on you.
          </p>
          <p>
            This website is meant to provide you with all the preliminary and basic information in respect of the group and our projects, therefore we request you to refrain from misusing and/or tampering with our website in any manner including but not limited to the introduction of viruses, trojans, etc., as the same will subject you necessary action under the applicable laws and regulations.
          </p>

          <h2>CONTENTS OF OUR SITE</h2>
          <p>
            All the details and materials disclosed on this website are provided for general guidance and information only, without warranties, guarantees, undertaking or term as to the condition, quality, state of readiness or fitness of any kind, either expressed or implied as to its completeness, accuracy, reliability, suitability or availability. Accessing / visiting this website does not constitute an offer and/or contract of any type between the Rustomjee Group and the viewer/recipient. None of our representatives or employees or consultants or agents or any person claiming through or under us has any authority to make or give any representation or warranty of any nature whatsoever in relation to any property. None of the information, materials or details mentioned on our website shall be regarded or taken as legal or financial advice and a thorough diligence of the same may be undertaken by you in that regard, if you so desire and deem fit.
          </p>
          <p>
            All transactions shall be subject to the terms and conditions of the Agreement to be entered into between Rustomjee Group and the intending party.
          </p>
          <p>
            All plans, specifications, designs, elevations, features, amenities, facilities and services mentioned in this website are indicative of the kind of development proposed and/or being undertaken for the respective projects and its finality is subject to the approval of the respective authorities. The Rustomjee Group reserves the right to change any or all of information, materials, images, project details visible on the website without prior notice or obligation. Artist&rsquo;s impressions are used to illustrate the amenities, specifications, images and other details and these may be applicable to select apartments only. All brands mentioned to be provided with respect to each specific project and/or apartment in a project is subject to availability and the Rustomjee Group and/or its representatives shall not be held liable in any manner whatsoever for the non-availability of such material. Tolerance of +/- 3% is possible in unit areas on account of design and construction exigencies.
          </p>

          <h2>SAFETY MEASURES</h2>
          <p>
            Though we have taken all the requisite care and precaution to make your experience of navigating and browsing our website an enjoyable and secure experience, we do not guarantee that our website will be secure or free from bugs or viruses. Therefore, we request you to use your own virus protection software.
          </p>

          <h2>INTELLECTUAL PROPERTY RIGHTS</h2>
          <p>
            The rights in terms of all the intellectual property on our website is held by us either as the owner or as a licensee. On visiting and browsing our website, you have deemed to have acknowledged and accepted that all of the copyright, database rights and any other intellectual property rights which subsist in the design, layout, processes, functions, data and content of our website belong to the Rustomjee Group or our licensors, information providers or contributors, as the case may be and we reserve all our rights in that regard. No part of our website, its contents or any of its underlying software and databases can be shared with any third party, reverse engineered, reverse assembled without our prior written consent.
          </p>
          <p>
            The contents, graphics, images, information and material as disclosed or depicted on this website are the exclusive property of the Rustomjee Group. No person shall use, copy, reproduce, imitate, publish, display, modify, create derivative works or database, transmit, exploit, sell or distribute the same in whole or in part. Facility, if any to print any article or portion of text material from the website through computer / electronic device does not tantamount to prior written consent, and will be strongly dealt with. Further using the contents, information, details and materials disclosed on this website for the purposes of any illustrations, photographs, video or audio sequences or any graphics separately from any accompanying text is not permitted.
          </p>

          <h2>PRIVACY POLICY</h2>
          <p>
            Our Privacy Policy which sets out the terms on which we process any personal data we collect from you or that you provide to us. By using our website, you consent to such processing and you warrant that all data provided by you is accurate.
          </p>

          <h2>LAWS &amp; JURISDICTION</h2>
          <p>
            The website terms and conditions shall be governed by the laws of India and the courts in Mumbai shall have exclusive jurisdiction in respect of any matter or dispute arising out of or in respect of the website terms and condition.
          </p>
        </div>
      </main>
    </div>
  );
}

