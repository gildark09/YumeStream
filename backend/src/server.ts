import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import NodeCache from 'node-cache';
import streamingService from './services/streamingService';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 300 });
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Create separate limiters for different endpoints
const streamLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Higher limit for streaming
  message: {
    error: 'Too many streaming requests, please try again later.'
  }
});

// Apply rate limiters to specific routes
app.use('/api/episodes', limiter); // General limiter for episode info
app.use('/api/proxy/m3u8', streamLimiter); // Higher limit for M3U8 requests
app.use('/api/proxy/ts', streamLimiter); // Higher limit for TS segments

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Stream endpoint
app.get('/api/stream/:episodeId/:quality', async (req, res) => {
  const { episodeId, quality } = req.params;
  
  try {
    const streamData = await streamingService.getStreamingLinks(episodeId);
    
    const source = streamData.sources.find((s: any) => s.quality === quality) || 
                  streamData.sources.find((s: any) => s.quality === 'default');

    if (!source || !source.url) {
      throw new Error('No valid stream URL found');
    }

    const videoResponse = await streamingService.proxyStream(source.url, streamData.headers);

    // Forward headers
    Object.entries(videoResponse.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // Pipe the stream
    videoResponse.data.pipe(res);

  } catch (error: any) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Failed to load stream' });
  }
});

// Episodes endpoint
app.get('/api/episodes/:episodeId', async (req, res) => {
  try {
    const { episodeId } = req.params;
    
    // First get the anime info to get total episodes
    const animeId = episodeId.split('-episode-')[0];
    const animeInfoResponse = await axios.get(
      `https://apiconsumetorg-zeta.vercel.app/anime/gogoanime/info/${animeId}`
    );

    // Get current episode number
    const currentEpNumber = parseInt(episodeId.split('-episode-')[1]);
    
    // Get video sources
    const response = await axios.get(
      `https://apiconsumetorg-zeta.vercel.app/anime/gogoanime/watch/${episodeId}`
    );

    if (!response.data) {
      throw new Error('No data received from API');
    }

    const { sources, headers } = response.data;
    const totalEpisodes = animeInfoResponse.data.totalEpisodes;
    
    // Calculate previous and next episodes
    const previousEpisode = currentEpNumber > 1 
      ? `${animeId}-episode-${currentEpNumber - 1}`
      : null;
      
    const nextEpisode = currentEpNumber < totalEpisodes 
      ? `${animeId}-episode-${currentEpNumber + 1}`
      : null;
    
    // Return processed video information
    res.json({
      episodeNumber: currentEpNumber,
      totalEpisodes,
      sources: sources,
      headers: headers,
      defaultSource: sources.find((s: any) => s.quality === 'default') || sources[0],
      previousEpisode,
      nextEpisode
    });

  } catch (error: any) {
    console.error('[Error in episodes endpoint]:', error);
    res.status(500).json({ 
      error: 'Failed to fetch episode information',
      details: error.message
    });
  }
});

// Update the M3U8 proxy endpoint
app.get('/api/proxy/m3u8', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'Referer': 'https://gogoanime.cl',
        'Origin': 'https://gogoanime.cl'
      }
    });

    // Get the base URL for the segments
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

    // Modify segment URLs to use our proxy
    const manifest = response.data.replace(
      /^(.+\.ts)$/gm,
      (match: string) => {
        const fullUrl = match.startsWith('http') ? match : baseUrl + match;
        return `proxy/ts?url=${encodeURIComponent(fullUrl)}`;
      }
    );

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(manifest);
  } catch (error) {
    console.error('M3U8 proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy M3U8' });
  }
});

// Update the TS segment proxy endpoint
app.get('/api/proxy/ts', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log('[TS Proxy] Fetching:', url);
    
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'Referer': 'https://gogoanime.cl',
        'Origin': 'https://gogoanime.cl'
      }
    });

    // Forward all headers
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Pipe the stream
    response.data.pipe(res);
  } catch (error) {
    console.error('TS proxy error:', error);
    res.status(500).json({ error: 'Failed to proxy TS segment' });
  }
});

// Add this route for search
app.get('/api/anime/gogoanime/top-airing', async (req, res) => {
  try {
    const response = await axios.get(
      'https://apiconsumetorg-zeta.vercel.app/anime/gogoanime/top-airing'
    );
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching top airing:', error);
    res.status(500).json({ 
      error: 'Failed to fetch top airing anime',
      details: error.message 
    });
  }
});

// Add search endpoint
app.get('/api/anime/gogoanime/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    console.log('Search request for:', query);

    const response = await axios.get(
      `https://apiconsumetorg-zeta.vercel.app/anime/gogoanime/${encodeURIComponent(query)}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    console.log('Search results count:', response.data?.results?.length || 0);
    res.json(response.data);
  } catch (error: any) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search anime',
      message: error.message 
    });
  }
});

// Add error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 