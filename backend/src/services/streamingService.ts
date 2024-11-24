import axios from 'axios';
import NodeCache from 'node-cache';

class StreamingService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
  }

  async getStreamingLinks(episodeId: string) {
    try {
      // Check cache first
      const cacheKey = `stream-${episodeId}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('Returning cached streaming data');
        return cached;
      }

      const response = await axios.get(
        `https://apiconsumetorg-zeta.vercel.app/anime/gogoanime/watch/${episodeId}`,
        {
          headers: {
            'Referer': 'https://gogoanime.cl',
            'Origin': 'https://gogoanime.cl'
          }
        }
      );

      if (!response.data || !response.data.sources) {
        throw new Error('No streaming sources found');
      }

      // Cache the response
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching streaming links:', error);
      throw error;
    }
  }

  async proxyStream(url: string, headers: any = {}) {
    try {
      return await axios({
        method: 'get',
        url,
        responseType: 'stream',
        headers: {
          ...headers,
          'Referer': 'https://gogoanime.cl',
          'Origin': 'https://gogoanime.cl'
        }
      });
    } catch (error) {
      console.error('Error proxying stream:', error);
      throw error;
    }
  }
}

export default new StreamingService(); 