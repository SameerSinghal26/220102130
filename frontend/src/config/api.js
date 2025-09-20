export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  LOGGING_URL: 'http://localhost:3000',
  ENDPOINTS: {
    SHORTEN: '/shorturls',
    REDIRECT: '/:shortcode',
    ANALYTICS: '/shorturls/:shortcode',
    LOGS: '/logs'
  }
};

export const APP_CONFIG = {
  DEFAULT_VALIDITY: 30,
  MAX_VALIDITY: 10080, // 1 week in minutes
  MIN_VALIDITY: 1
};