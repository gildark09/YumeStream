import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const searchAnime = async (query: string) => {
  try {
    const response = await axios.get(`${API_URL}/anime/gogoanime/search/${encodeURIComponent(query)}`);
    return response.data;
  } catch (error: any) {
    console.error('Search error:', error);
    throw new Error(error.response?.data?.message || 'Failed to search anime');
  }
}; 