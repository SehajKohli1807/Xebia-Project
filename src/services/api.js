import axios from 'axios';

const LQT_API_KEY = process.env.REACT_APP_LOQUATE_API_KEY;

export const fetchLoquateSuggestions = async (term) => {
  try {
    const response = await axios.post('https://api.everythinglocation.com/address/complete', {
      lqtkey: LQT_API_KEY,
      query: term,
      country:'us'
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    return response?.data?.output || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};