import {
  getMarketingData,
  extractParamsFromUrl,
  detectDevice,
  resolveApiEndpoint,
  sendLeadToApi,
  initMarketing,
  DEFAULT_MARKETING_PARAMS,
} from '../lib/marketing.js';

export {
  getMarketingData,
  extractParamsFromUrl,
  detectDevice,
  resolveApiEndpoint,
  sendLeadToApi,
  initMarketing,
  DEFAULT_MARKETING_PARAMS,
};

export const captureMarketingParams = () => {
  return getMarketingData();
};

export default getMarketingData;

