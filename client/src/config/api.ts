export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  json: {
    format: `${API_BASE_URL}/tools/json/format`,
    validate: `${API_BASE_URL}/tools/json/validate`,
    minify: `${API_BASE_URL}/tools/json/minify`,
  },
  base64: {
    encode: `${API_BASE_URL}/tools/base64/encode`,
    decode: `${API_BASE_URL}/tools/base64/decode`,
  },
  url: {
    encode: `${API_BASE_URL}/tools/url/encode`,
    decode: `${API_BASE_URL}/tools/url/decode`,
  }
};