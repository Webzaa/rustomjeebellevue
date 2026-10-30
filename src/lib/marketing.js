/**
 * Marketing & UTM Tracking Module
 * 
 * Captures, persists, and formats marketing UTM parameters for lead submission to api.php.
 * 
 * Target UTM parameters:
 * ?utm_source=Google&utm_sub_source=Search&utm_medium=cpc
 * &utm_campaignname={campaignname}&utm_campaignid={campaignid}
 * &utm_adgroupname={adgroupname}&utm_adgroupid={adgroupid}&utm_adname={creative}
 * &gclid={gclid}&Lead_Keyword={keyword}&Lead_Placement={placement}&Lead_Device={device}
 * &campaignname=Digital_FY_26_27&campaigncode=FY26_27
 */

const STORAGE_KEY = 'rvv_marketing_utm_data';

// Default configuration with user-specified campaign & UTM values
export const DEFAULT_MARKETING_PARAMS = {
  utm_source: '',
  utm_sub_source: '',
  utm_medium: '',
  utm_campaignname: '',
  utm_campaignid: '',
  utm_adgroupname: '',
  utm_adgroupid: '',
  utm_adname: '',
  gclid: '',
  Lead_Keyword: '',
  Lead_Placement: '',
  Lead_Device: '',
  campaignname: 'Digital_FY_26_27',
  campaigncode: 'FY26_27',
  project: 'Rustomjee Bellevue',
  websitename: 'Rustomjee Bellevue',
};

/**
 * Detect client device type if template macro {device} is present or not provided
 */
export function detectDevice() {
  if (typeof window === 'undefined' || !window.navigator) return 'Desktop';
  const ua = navigator.userAgent || '';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Clean macro template values like {device}, {keyword} if unreplaced by ad platform
 */
function normalizeParam(key, value, fallback) {
  if (!value || value.trim() === '') return fallback;
  if (/^\{[a-zA-Z0-9_-]+\}$/.test(value.trim())) {
    if (key === 'Lead_Device' || key === 'device') {
      return detectDevice();
    }
    return fallback !== undefined ? fallback : value.trim();
  }
  return value.trim();
}

/**
 * Extract UTM and marketing parameters from URL query string and hash
 */
export function extractParamsFromUrl() {
  if (typeof window === 'undefined') return {};
  
  const searchParams = new URLSearchParams(window.location.search);
  
  let hashParams = new URLSearchParams();
  if (window.location.hash && window.location.hash.includes('?')) {
    const hashQuery = window.location.hash.split('?')[1];
    hashParams = new URLSearchParams(hashQuery);
  }

  const getVal = (key) => searchParams.get(key) || hashParams.get(key);

  const extracted = {};

  const keysToTrack = [
    'utm_source',
    'utm_sub_source',
    'utm_medium',
    'utm_campaignname',
    'utm_campaignid',
    'utm_adgroupname',
    'utm_adgroupid',
    'utm_adname',
    'utm_adcreative',
    'utm_adset',
    'gclid',
    'gad_source',
    'gad_campaignid',
    'gbraid',
    'Lead_Keyword',
    'Lead_Placement',
    'Lead_Device',
    'campaignname',
    'campaigncode',
  ];

  const aliases = {
    keyword: 'Lead_Keyword',
    placement: 'Lead_Placement',
    device: 'Lead_Device',
    utm_adset: 'utm_adgroupname',
    adset: 'utm_adgroupname',
    adgroupname: 'utm_adgroupname',
    adgroupid: 'utm_adgroupid',
    adcreative: 'utm_adname',
    creative: 'utm_adname',
    gad_campaignid: 'utm_campaignid',
    campaignid: 'utm_campaignid',
    campaign_name: 'utm_campaignname',
    utm_campaign: 'utm_campaignname',
  };

  keysToTrack.forEach((key) => {
    const val = getVal(key);
    if (val !== null && val !== '') {
      extracted[key] = val;
    }
  });

  Object.entries(aliases).forEach(([alias, targetKey]) => {
    if (!extracted[targetKey]) {
      const val = getVal(alias);
      if (val !== null && val !== '') {
        extracted[targetKey] = val;
      }
    }
  });

  return extracted;
}

/**
 * Load marketing data from storage (sessionStorage with localStorage fallback)
 */
function loadStoredMarketing() {
  if (typeof window === 'undefined') return {};
  try {
    const sessionData = sessionStorage.getItem(STORAGE_KEY);
    if (sessionData) return JSON.parse(sessionData);

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) return JSON.parse(localData);
  } catch (err) {
    console.warn('Storage access failed:', err);
  }
  return {};
}

/**
 * Save marketing data to storage
 */
function persistMarketing(data) {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(data);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.warn('Failed to persist marketing data:', err);
  }
}

/**
 * Get comprehensive marketing & UTM parameters.
 */
export function getMarketingData() {
  const stored = loadStoredMarketing();
  const fromUrl = extractParamsFromUrl();

  if (Object.keys(fromUrl).length > 0) {
    const updated = { ...stored, ...fromUrl };
    persistMarketing(updated);
  }

  const merged = {
    ...DEFAULT_MARKETING_PARAMS,
    ...stored,
    ...fromUrl,
  };

  [
    'utm_source',
    'utm_sub_source',
    'utm_medium',
    'utm_campaignname',
    'utm_campaignid',
    'utm_adgroupname',
    'utm_adgroupid',
    'utm_adname',
    'gclid',
    'gad_source',
    'gad_campaignid',
    'gbraid',
  ].forEach((key) => {
    merged[key] = normalizeParam(key, merged[key], '');
  });

  const rawDevice = merged.Lead_Device || merged.device;
  merged.Lead_Device = normalizeParam('Lead_Device', rawDevice, detectDevice());
  merged.device = merged.Lead_Device;

  merged.Lead_Keyword = normalizeParam('Lead_Keyword', merged.Lead_Keyword, '');
  merged.keyword = merged.Lead_Keyword;

  merged.Lead_Placement = normalizeParam('Lead_Placement', merged.Lead_Placement, 'Google Search');
  merged.placement = merged.Lead_Placement;

  if (!merged.campaignname) {
    merged.campaignname = 'Digital_FY_26_27';
  }
  if (!merged.campaigncode) {
    merged.campaigncode = 'FY26_27';
  }

  return merged;
}

/**
 * Alias export for captureMarketingParams
 */
export const captureMarketingParams = getMarketingData;

/**
 * Resolve the API endpoint for api.php
 */
export function resolveApiEndpoint(customEndpoint) {
  if (customEndpoint) return customEndpoint;
  if (typeof window !== 'undefined' && window.MARKETING_API_ENDPOINT) {
    return window.MARKETING_API_ENDPOINT;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) {
    return `${import.meta.env.VITE_BACKEND_URL}/api/api.php`;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_ENDPOINT) {
    return import.meta.env.VITE_API_ENDPOINT;
  }

  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.includes('/Rustomjee_Verdant_Vistas/')) {
      return '/Rustomjee_Verdant_Vistas/api/api.php';
    }
  }

  return './api/api.php';
}

/**
 * Send lead details and all UTM tracking parameters to api.php
 */
export async function sendLeadToApi(leadData = {}, options = {}) {
  const marketing = getMarketingData();
  const endpoint = resolveApiEndpoint(options.apiEndpoint);

  let rawMobile = String(leadData.phone || leadData.mobile || '').trim();
  rawMobile = rawMobile.replace(/[^\d+]/g, '');
  let countrycode = leadData.countrycode || '+91';
  let cleanMobile = rawMobile;

  if (cleanMobile.startsWith('+91')) {
    countrycode = '+91';
    cleanMobile = cleanMobile.slice(3);
  } else if (cleanMobile.startsWith('91') && cleanMobile.length > 10) {
    countrycode = '+91';
    cleanMobile = cleanMobile.slice(2);
  }

  const payload = {
    name: leadData.name || '',
    email: leadData.email || '',
    mobile: cleanMobile,
    countrycode: countrycode,

    utm_source: marketing.utm_source || '',
    utm_sub_source: marketing.utm_sub_source || '',
    utm_medium: marketing.utm_medium || '',
    utm_campaignname: marketing.utm_campaignname || '',
    campaign_name: marketing.utm_campaignname || '',
    utm_campaignid: marketing.utm_campaignid || '',
    gad_campaignid: marketing.utm_campaignid || '',

    utm_adgroupname: marketing.utm_adgroupname || '',
    utm_adset: marketing.utm_adgroupname || '',
    utm_adgroupid: marketing.utm_adgroupid || '',
    ad_id: marketing.utm_adgroupid || '',

    utm_adname: marketing.utm_adname || '',
    adcreative: marketing.utm_adname || '',

    gclid: marketing.gclid || '',
    Lead_Keyword: marketing.Lead_Keyword || '',
    keyword: marketing.Lead_Keyword || '',
    Lead_Placement: marketing.Lead_Placement || '',
    placement: marketing.Lead_Placement || '',
    Lead_Device: marketing.Lead_Device || detectDevice(),
    device: marketing.Lead_Device || detectDevice(),

    campaignname: marketing.campaignname || 'Digital_FY_26_27',
    campaigncode: marketing.campaigncode || 'FY26_27',

    project: leadData.project || 'Rustomjee Bellevue',
    websitename: 'Rustomjee Bellevue',
    projectSelectValues: leadData.project || 'Rustomjee Bellevue',
    formname: leadData.formname || leadData.formId || 'enquiry',
    form_id: leadData.form_id || leadData.formId || 'enquiry',
    configInterestValues: leadData.interested_in ? [leadData.interested_in] : [''],
    visitdayValues: leadData.preferred_visit ? [leadData.preferred_visit] : [''],
    duplicate: 'no',
    page_url: typeof window !== 'undefined' ? window.location.href.split('#')[0] : '',
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { status: response.ok ? 1 : 0, msg: responseText };
    }

    return result;
  } catch (networkError) {
    console.error('Failed to send lead to api.php:', networkError);
    throw networkError;
  }
}

/**
 * Initialize marketing tracking on page load
 */
export function initMarketing() {
  if (typeof window === 'undefined') return;
  const current = getMarketingData();
  window.Marketing = {
    getMarketingData,
    captureMarketingParams,
    sendLeadToApi,
    detectDevice,
    resolveApiEndpoint,
    data: current,
  };
  return current;
}

if (typeof window !== 'undefined') {
  initMarketing();
}
