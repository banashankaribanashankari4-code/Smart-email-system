import axios from 'axios';
 
const BASE = 'https://smart-email-system.onrender.com/api';
 
export const analyzeEmail = (emailData, language = 'English') =>
  axios.post(`${BASE}/email/analyze`, { ...emailData, language }).then(r => r.data);
 
export const regenerateReply = (emailData, language = 'English') =>
  axios.post(`${BASE}/email/regenerate-reply`, { ...emailData, language }).then(r => r.data);