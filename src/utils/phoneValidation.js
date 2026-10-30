/**
 * Phone number validation and cleaning utility
 */

/**
 * Clean phone number based on country data.
 * For India (+91), extracts the 10-digit mobile number.
 * For international numbers, returns cleaned digits.
 */
export function cleanPhoneNumber(mobile, countryData = {}) {
  if (!mobile) return '';
  const digits = String(mobile).replace(/\D/g, '');
  const dialCode = String(countryData?.dialCode || '91').replace(/\D/g, '');

  if (dialCode === '91') {
    if (digits.length === 12 && digits.startsWith('91')) {
      return digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return digits.slice(1);
    }
    if (digits.length >= 10) {
      return digits.slice(-10);
    }
    return digits;
  }

  if (digits.startsWith(dialCode)) {
    return digits.slice(dialCode.length);
  }
  return digits;
}

/**
 * Validate phone number based on country data.
 */
export function validatePhoneNumber(mobile, countryData = {}) {
  const raw = String(mobile || '').trim();
  if (!raw) {
    return { isValid: false, error: 'Please enter your mobile number.' };
  }

  const cleanDigits = raw.replace(/\D/g, '');
  const dialCode = String(countryData?.dialCode || '91').replace(/\D/g, '');

  if (dialCode === '91') {
    const cleaned = cleanPhoneNumber(raw, countryData);
    if (cleaned.length !== 10) {
      return { isValid: false, error: 'Please enter a valid 10-digit mobile number.' };
    }
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      return { isValid: false, error: 'Mobile number must start with 6, 7, 8, or 9.' };
    }
    return { isValid: true, cleaned };
  }

  if (cleanDigits.length < 7 || cleanDigits.length > 15) {
    return { isValid: false, error: 'Please enter a valid mobile number (7-15 digits).' };
  }

  return { isValid: true, cleaned: cleanDigits };
}

