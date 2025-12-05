/**
 * Phone number validation and normalization utilities
 */

/**
 * Validate phone number format
 */
function isValidPhoneNumber(phoneNumber) {
  // Remove whitespace and common formatting
  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it matches international format
  const internationalRegex = /^\+[1-9]\d{1,14}$/;
  
  // Check if it matches WhatsApp format (whatsapp:+number)
  const whatsappRegex = /^whatsapp:\+[1-9]\d{1,14}$/;
  
  return internationalRegex.test(cleaned) || whatsappRegex.test(phoneNumber);
}

/**
 * Normalize phone number to consistent format
 */
function normalizePhoneNumber(phoneNumber) {
  // Handle WhatsApp format
  if (phoneNumber.startsWith('whatsapp:')) {
    return phoneNumber.replace('whatsapp:', '');
  }
  
  // Remove all formatting except +
  let normalized = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    // If it looks like a US number (10 digits), add +1
    if (normalized.length === 10 && normalized.match(/^\d{10}$/)) {
      normalized = '+1' + normalized;
    }
    // If it looks like a US number with country code (11 digits starting with 1)
    else if (normalized.length === 11 && normalized.startsWith('1')) {
      normalized = '+' + normalized;
    }
    // Otherwise, assume it needs + prefix
    else if (normalized.length > 0) {
      normalized = '+' + normalized;
    }
  }
  
  return normalized;
}

/**
 * Get country code from phone number
 */
function getCountryCode(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Common country codes (extend as needed)
  const countryCodes = {
    '+1': 'US/CA',
    '+44': 'UK',
    '+49': 'DE',
    '+33': 'FR',
    '+39': 'IT',
    '+34': 'ES',
    '+81': 'JP',
    '+86': 'CN',
    '+91': 'IN',
    '+55': 'BR',
    '+7': 'RU',
    '+61': 'AU',
    '+31': 'NL',
    '+46': 'SE',
    '+47': 'NO',
    '+45': 'DK',
    '+41': 'CH',
    '+43': 'AT',
    '+32': 'BE',
    '+351': 'PT',
    '+30': 'GR',
    '+48': 'PL',
    '+420': 'CZ',
    '+36': 'HU',
    '+40': 'RO',
    '+421': 'SK',
    '+385': 'HR',
    '+386': 'SI',
    '+372': 'EE',
    '+371': 'LV',
    '+370': 'LT',
    '+358': 'FI',
    '+354': 'IS'
  };
  
  // Try to match country codes (longest first)
  const sortedCodes = Object.keys(countryCodes).sort((a, b) => b.length - a.length);
  
  for (const code of sortedCodes) {
    if (normalized.startsWith(code)) {
      return {
        code: code,
        country: countryCodes[code],
        number: normalized.substring(code.length)
      };
    }
  }
  
  return {
    code: 'unknown',
    country: 'Unknown',
    number: normalized.substring(1) // Remove + prefix
  };
}

/**
 * Format phone number for display
 */
function formatForDisplay(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);
  const countryInfo = getCountryCode(normalized);
  
  if (countryInfo.code === '+1' && countryInfo.number.length === 10) {
    // US/Canada format: +1 (555) 123-4567
    const number = countryInfo.number;
    return `${countryInfo.code} (${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
  }
  
  // International format with spaces
  const number = countryInfo.number;
  if (number.length >= 10) {
    return `${countryInfo.code} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  } else if (number.length >= 7) {
    return `${countryInfo.code} ${number.substring(0, 3)} ${number.substring(3)}`;
  }
  
  return normalized;
}

/**
 * Generate session ID from phone number
 */
function generateSessionId(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);
  // Remove + and use as session ID
  return normalized.replace('+', '');
}

/**
 * Check if phone number is from a test/sandbox account
 */
function isSandboxNumber(phoneNumber) {
  const testNumbers = [
    '+14155238886', // Twilio sandbox
    '+15005550006', // Test number
    '+15005550001', // Test number
  ];
  
  const normalized = normalizePhoneNumber(phoneNumber);
  return testNumbers.includes(normalized);
}

/**
 * Validate WhatsApp-specific phone number requirements
 */
function isValidWhatsAppNumber(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // WhatsApp requirements:
  // - Must be in E.164 format (+countrycode followed by phone number)
  // - No leading zeros after country code
  // - Maximum 15 digits total (including country code)
  // - Minimum 8 digits total
  
  if (!normalized.startsWith('+')) {
    return false;
  }
  
  const digitsOnly = normalized.substring(1);
  
  // Check digit count
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return false;
  }
  
  // Check for leading zeros after country code
  const countryInfo = getCountryCode(normalized);
  if (countryInfo.number.startsWith('0')) {
    return false;
  }
  
  // Must be all digits after +
  if (!/^\d+$/.test(digitsOnly)) {
    return false;
  }
  
  return true;
}

module.exports = {
  isValidPhoneNumber,
  normalizePhoneNumber,
  getCountryCode,
  formatForDisplay,
  generateSessionId,
  isSandboxNumber,
  isValidWhatsAppNumber
};