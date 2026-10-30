import { useEffect, useRef, useState } from 'react';
import intlTelInput from 'intl-tel-input';
import { getMarketingData, detectDevice } from '../lib/marketing.js';
import { cleanPhoneNumber, validatePhoneNumber } from '../utils/phoneValidation.js';

const captureMarketingParams = getMarketingData;

const API_URL = './api/api.php';
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const initialCountry = {
  name: 'India',
  dialCode: '+91',
  countryCode: 'in',
};

export default function PopupForm({ onSuccess }) {
  const formRef = useRef(null);
  const phoneRef = useRef(null);
  const itiRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' | 'error'
  const [sending, setSending] = useState(false);
  const [dialCode, setDialCode] = useState('+91');
  const [countryData, setCountryData] = useState(initialCountry);

  useEffect(() => {
    const input = phoneRef.current;
    if (!input) return;

    let itiInstance = null;
    try {
      itiInstance = intlTelInput(input, {
        initialCountry: 'in',
        separateDialCode: true,
        nationalMode: true,
        countryOrder: ['in', 'ae', 'us', 'gb'],
      });
      itiRef.current = itiInstance;

      const updateCountry = () => {
        try {
          const c = itiInstance.getSelectedCountryData();
          const dial = c && c.dialCode ? (String(c.dialCode).startsWith('+') ? c.dialCode : `+${c.dialCode}`) : '+91';
          setDialCode(dial);
          setCountryData({
            name: c?.name || 'India',
            dialCode: dial,
            countryCode: (c?.iso2 || 'in').toLowerCase(),
          });
          setErrors((prev) => (prev.phone ? { ...prev, phone: '' } : prev));
        } catch {
          setDialCode('+91');
          setCountryData(initialCountry);
        }
      };

      updateCountry();
      input.addEventListener('countrychange', updateCountry);

      import('intl-tel-input/utils').catch(() => {});

      return () => {
        input.removeEventListener('countrychange', updateCountry);
        if (itiInstance) itiInstance.destroy();
      };
    } catch (err) {
      console.warn('intl-tel-input init error:', err);
    }
  }, []);

  const validateField = (name, value, allValues = {}) => {
    const val = (value || '').trim();
    if (name === 'name') {
      if (!val) return 'Please enter your full name.';
      if (val.length < 2) return 'Name must be at least 2 characters.';
      if (!/^[a-zA-Z\s'.]+$/.test(val)) return 'Name should contain letters only.';
      return '';
    }
    if (name === 'phone') {
      const check = validatePhoneNumber(val, countryData);
      return check.isValid ? '' : (check.error || 'Please enter a valid mobile number.');
    }
    if (name === 'email') {
      if (!val) return '';
      if (!EMAIL_RE.test(val)) {
        return 'Please enter a valid email address.';
      }
      return '';
    }
    if (name === 'consent') {
      if (!allValues.consent) {
        return 'Please agree to be contacted to continue.';
      }
      return '';
    }
    return '';
  };

  const onInput = (e) => {
    const n = e.target.name;
    if (n) {
      setErrors((prev) => (prev[n] ? { ...prev, [n]: '' } : prev));
    }
  };

  const onPhoneInput = (e) => {
    const val = e.target.value;
    if (/[^\d\s\-\+\(\)]/.test(val)) {
      e.target.value = val.replace(/[^\d\s\-\+\(\)]/g, '');
    }
    setErrors((prev) => (prev.phone ? { ...prev, phone: '' } : prev));
  };

  const onBlur = (e) => {
    const n = e.target.name;
    if (!n) return;
    const f = formRef.current;
    if (!f) return;
    const val = n === 'phone' ? phoneRef.current?.value : f.elements[n]?.value;
    const err = validateField(n, val, { consent: f.elements.consent?.checked });
    if (err) {
      setErrors((prev) => ({ ...prev, [n]: err }));
    }
  };

  const buildPayload = (values = {}) => {
    const marketing = captureMarketingParams() || getMarketingData() || {};
    const cleanMobile = cleanPhoneNumber(values.phone || phoneRef.current?.value || '', countryData);
    const code = countryData.dialCode
      ? (countryData.dialCode.startsWith('+') ? countryData.dialCode : `+${countryData.dialCode}`)
      : (dialCode.startsWith('+') ? dialCode : `+${dialCode}`);

    return {
      // Lead details
      name: (values.name || formRef.current?.elements?.name?.value || '').trim(),
      email: (values.email || formRef.current?.elements?.email?.value || '').trim(),
      mobile: cleanMobile,
      countrycode: code,
      countryname: countryData.name || 'India',

      // Project
      projectSelectValues: 'Rustomjee Bellevue',
      configuration: '',

      // API required fields
      configInterestValues: [''],
      configTypeValues: [''],
      purposeValues: [''],
      visitdayValues: [''],
      favdestinationValues: [''],

      // Form details
      formname: 'Rustomjee Bellevue Popup Form',
      form_id: '',
      leadgen_id: '',
      page_id: '',
      ad_id: '',

      // Marketing parameters
      utm_source: marketing.utm_source || '',
      utm_sub_source: marketing.utm_sub_source || '',
      utm_medium: marketing.utm_medium || '',
      campaigncode: marketing.campaigncode || '',
      campaignname: marketing.campaignname || marketing.utm_campaignname || '',
      utm_campaignname: marketing.utm_campaignname || marketing.campaignname || '',
      utm_campaignid: marketing.utm_campaignid || marketing.gad_campaignid || '',
      utm_adset: marketing.utm_adset || marketing.utm_adgroupname || '',
      utm_adgroupname: marketing.utm_adgroupname || marketing.utm_adset || '',
      utm_adgroupid: marketing.utm_adgroupid || '',
      utm_adname: marketing.utm_adname || marketing.utm_adcreative || '',
      utm_adcreative: marketing.utm_adcreative || marketing.utm_adname || '',
      Lead_Keyword: marketing.Lead_Keyword || marketing.keyword || '',
      keyword: marketing.keyword || marketing.Lead_Keyword || '',
      Lead_Placement: marketing.Lead_Placement || marketing.placement || '',
      placement: marketing.placement || marketing.Lead_Placement || '',
      Lead_Device: marketing.Lead_Device || marketing.device || detectDevice(),
      device: marketing.device || marketing.Lead_Device || detectDevice(),
      gad_source: marketing.gad_source || '',
      gad_campaignid: marketing.gad_campaignid || marketing.utm_campaignid || '',
      gbraid: marketing.gbraid || '',
      gclid: marketing.gclid || '',

      // Website
      websitename: typeof window !== 'undefined' ? window.location.hostname : '',
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setMsgType('');
    const f = formRef.current;
    if (!f) return;

    const name = f.elements.name?.value?.trim() || '';
    const email = f.elements.email?.value?.trim() || '';
    const consent = f.elements.consent ? f.elements.consent.checked : true;
    const rawPhone = phoneRef.current?.value?.trim() || '';

    const newErrors = {};
    const nameErr = validateField('name', name);
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validateField('phone', rawPhone);
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateField('email', email);
    if (emailErr) newErrors.email = emailErr;

    if (!consent) {
      newErrors.consent = 'Please agree to be contacted to continue.';
    }

    setErrors(newErrors);

    const firstBad = ['name', 'phone', 'email', 'consent'].find((k) => newErrors[k]);
    if (firstBad) {
      const el = firstBad === 'phone' ? phoneRef.current : f.elements[firstBad];
      if (el && el.focus) el.focus();
      return;
    }

    setSending(true);

    try {
      const payload = buildPayload({ name, phone: rawPhone, email });
      console.log('Submitting lead from PopupForm:', payload);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result && result.status !== undefined && Number(result.status) !== 1) {
        throw new Error(result.msg || 'Lead submission failed.');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('form_submission_status', 'success');
        sessionStorage.setItem('lead_name', name);
        sessionStorage.removeItem('form_error_msg');
      }

      setMsgType('success');
      setMsg('Thank you for your interest! Our team will contact you shortly to schedule your private villa preview.');
      f.reset();
      if (phoneRef.current) phoneRef.current.value = '';
      setErrors({});
      if (onSuccess) onSuccess();
      window.location.hash = '#thank-you';
    } catch (error) {
      console.error('Lead submission failed:', error);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('form_submission_status', 'failed');
        sessionStorage.setItem('form_error_msg', error?.message || 'Unable to submit your enquiry.');
      }
      setMsgType('error');
      setMsg(error?.message || 'Could not submit form. Please check your connection and try again.');
      setErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Unable to submit your enquiry. Please try again.',
      }));
      if (onSuccess) onSuccess();
      window.location.hash = '#oops';
    }
    setSending(false);
  };

  return (
    <form
      id="f2"
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      onInput={onInput}
      className="popup-form contactform"
    >
      <div className={`f-field${errors.name ? ' has-error' : ''}`}>
        <input
          name="name"
          autoComplete="name"
          required
          placeholder="Enter your full name *"
          aria-label="Full name"
          aria-invalid={!!errors.name}
          onBlur={onBlur}
        />
        {errors.name && <span className="err" data-for="name">{errors.name}</span>}
      </div>

      <div className={`f-field${errors.phone ? ' has-error' : ''}`}>
        <input
          ref={phoneRef}
          id="popup-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="Enter 10-digit mobile number *"
          aria-label="Mobile number"
          aria-invalid={!!errors.phone}
          onInput={onPhoneInput}
          onBlur={onBlur}
        />
        <input type="hidden" name="country_code" value={dialCode} readOnly />
        {errors.phone && <span className="err" data-for="phone">{errors.phone}</span>}
      </div>

      <div className={`f-field${errors.email ? ' has-error' : ''}`}>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address (optional)"
          aria-label="Email address"
          aria-invalid={!!errors.email}
          onBlur={onBlur}
        />
        {errors.email && <span className="err" data-for="email">{errors.email}</span>}
      </div>

      <div className={`f-field f-field-ck${errors.consent ? ' has-error' : ''}`}>
        <label className="ck">
          <input
            type="checkbox"
            name="consent"
            defaultChecked
            onChange={() => setErrors((prev) => ({ ...prev, consent: '' }))}
          />
          <span>I agree to be contacted about Villa Altura at Rustomjee Belle Vue, Kasara.</span>
        </label>
        {errors.consent && <span className="err" data-for="consent">{errors.consent}</span>}
      </div>

      {errors.submit && (
        <span className="err" style={{ display: 'block', textAlign: 'center', marginBottom: '0.75rem' }}>
          {errors.submit}
        </span>
      )}

      <button className="btn" type="submit" disabled={sending}>
        {sending ? 'Submitting…' : 'Book My Site Visit'}
      </button>

      {msg && (
        <div
          className={`form-feedback ${msgType === 'success' ? 'form-success' : 'form-error'}`}
          role="status"
          aria-live="polite"
        >
          <span className="feedback-icon">{msgType === 'success' ? '✓' : '⚠'}</span>
          <span>{msg}</span>
        </div>
      )}
    </form>
  );
}
