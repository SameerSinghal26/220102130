export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const extractShortcode = (shortUrl) => {
  try {
    const url = new URL(shortUrl);
    return url.pathname.substring(1);
  } catch {
    return null;
  }
};

export const isValidShortcode = (shortcode) => {
  return /^[a-zA-Z0-9_-]+$/.test(shortcode) && shortcode.length >= 1 && shortcode.length <= 20;
};