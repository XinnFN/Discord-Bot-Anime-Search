import axios from 'axios';

console.log('Testing Jikan API...');

const testAPI = async () => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/anime', {
      params: { q: 'naruto', limit: 5 },
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('✅ API Working!');
    console.log('Status:', response.status);
    console.log('Results:', response.data.data.length);
    console.log('First result:', response.data.data[0].title);
  } catch (error) {
    console.log('❌ API Error!');
    console.log('Error:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Code:', error.code);
  }
};

testAPI();
