<template>
  <div class="min-h-screen bg-gray-900 text-white font-sans pt-20">
    <div class="container mx-auto px-4">
      <div class="video-container bg-gray-800 rounded-lg overflow-hidden">
        <!-- Video Player Container -->
        <div class="relative aspect-video">
          <!-- Loading State -->
          <div v-if="isLoading" 
               class="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p class="mt-4 text-gray-400">Loading video...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" 
               class="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div class="text-center">
              <p class="text-red-500 mb-4">{{ error }}</p>
              <button @click="retryLoading" 
                      class="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition">
                Try Again
              </button>
            </div>
          </div>

          <!-- Video Player -->
          <video
            ref="videoPlayer"
            class="w-full h-full"
            controls
            crossorigin="anonymous"
            playsinline
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <!-- Episode Navigation -->
        <div class="p-4 flex justify-between items-center bg-gray-800 border-t border-gray-700">
          <button 
            @click="playPreviousEpisode"
            class="px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!previousEpisodeId"
          >
            Previous Episode
          </button>
          <div class="text-center">
            <span class="text-gray-300">Episode {{ currentEpisodeNumber }}</span>
          </div>
          <button 
            @click="playNextEpisode"
            class="px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!nextEpisodeId"
          >
            Next Episode
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import Hls from 'hls.js'

const route = useRoute()
const router = useRouter()
const videoPlayer = ref<HTMLVideoElement | null>(null)
const plyr = ref<Plyr | null>(null)
const isLoading = ref(true)
const error = ref('')
const currentEpisodeNumber = ref('')
const previousEpisodeId = ref('')
const nextEpisodeId = ref('')

const API_URL = 'http://localhost:3000/api'

const initPlayer = (videoUrl: string, quality: string) => {
  if (!videoPlayer.value) return;

  destroyPlayer();

  plyr.value = new Plyr(videoPlayer.value, {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings',
      'fullscreen'
    ]
  });

  if (Hls.isSupported()) {
    const hls = new Hls({
      xhrSetup: (xhr) => {
        xhr.withCredentials = false;
      },
      maxBufferSize: 0,
      maxBufferLength: 30,
      enableWorker: true,
      lowLatencyMode: true,
      debug: true,
      maxRetryDelay: 4000,
      retryDelay: 1000,
      loader: class CustomLoader extends Hls.DefaultConfig.loader {
        constructor(config: any) {
          super(config);
          const load = this.load.bind(this);
          this.load = (context: any, config: any, callbacks: any) => {
            const url = context.url;
            
            // Modify URLs to use our proxy
            if (url.endsWith('.m3u8')) {
              context.url = `${API_URL}/proxy/m3u8?url=${encodeURIComponent(url)}`;
              console.log('[HLS] Loading M3U8:', context.url);
            } else if (url.includes('proxy/ts')) {
              // Fix the TS URL construction - remove duplicate API URLs
              const tsUrl = url.replace(/^.*proxy\/ts/, 'proxy/ts');
              context.url = `${API_URL}/${tsUrl}`;
              console.log('[HLS] Loading TS:', context.url);
            }
            
            load(context, config, callbacks);
          };
        }
      }
    });

    hls.loadSource(videoUrl);
    hls.attachMedia(videoPlayer.value);

    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      console.log('[HLS] Media attached');
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('[HLS] Manifest parsed');
      videoPlayer.value?.play().catch(err => {
        console.log('Auto-play prevented:', err);
      });
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('[HLS] Error:', data);
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('[HLS] Network error, attempting recovery');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('[HLS] Media error, attempting recovery');
            hls.recoverMediaError();
            break;
          default:
            console.error('[HLS] Fatal error, destroying player');
            destroyPlayer();
            error.value = 'Failed to load video stream';
            break;
        }
      }
    });

    plyr.value.on('destroy', () => {
      hls.destroy();
    });
  }
};

const destroyPlayer = () => {
  if (plyr.value) {
    try {
      plyr.value.destroy();
    } catch (err) {
      console.error('Error destroying player:', err);
    }
    plyr.value = null;
  }
};

const loadVideo = async () => {
  console.log('[1] Starting video load for episode:', route.params.episodeId);
  isLoading.value = true;
  error.value = '';
  
  try {
    const episodeUrl = `${API_URL}/episodes/${route.params.episodeId}`;
    console.log('[2] Fetching from:', episodeUrl);

    const response = await fetch(episodeUrl);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      const seconds = parseInt(retryAfter);
      throw new Error(`Rate limit exceeded. Please wait ${seconds} seconds and try again.`);
    }
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('[3] Episode data:', data);
    
    if (!data.sources || data.sources.length === 0) {
      throw new Error('No video sources available');
    }
    
    currentEpisodeNumber.value = data.episodeNumber?.toString() || '';
    previousEpisodeId.value = data.previousEpisode || '';
    nextEpisodeId.value = data.nextEpisode || '';

    // Get highest quality source
    const source = data.sources.find((s: any) => s.quality === '1080p') || 
                  data.sources.find((s: any) => s.quality === '720p') ||
                  data.defaultSource;

    if (source && source.url) {
      console.log('[4] Initializing player with source:', source.quality);
      initPlayer(source.url, source.quality);
    } else {
      throw new Error('No valid video URL found');
    }
    
  } catch (err: any) {
    console.error('[Error in loadVideo]:', err);
    error.value = err?.message || 'Failed to load video';
    
    // Add retry button if rate limited
    if (err.message.includes('Rate limit exceeded')) {
      error.value = err.message;
    }
  } finally {
    isLoading.value = false;
  }
};

const playNextEpisode = () => {
  if (nextEpisodeId.value) {
    router.push({ name: 'watch', params: { episodeId: nextEpisodeId.value }})
  }
}

const playPreviousEpisode = () => {
  if (previousEpisodeId.value) {
    router.push({ name: 'watch', params: { episodeId: previousEpisodeId.value }})
  }
}

const handlePlayerError = (err: any) => {
  console.error('Player error:', err);
  error.value = 'Failed to load video. Please try again.';
  isLoading.value = false;
};

const retryLoading = () => {
  error.value = '';
  isLoading.value = true;
  loadVideo();
};

// Add retry with delay
const retryWithDelay = (delay: number) => {
  setTimeout(() => {
    retryLoading();
  }, delay * 1000);
};

onMounted(() => {
  loadVideo()
})

watch(() => route.params.episodeId, () => {
  loadVideo()
})

// Clean up video player on component unmount
onBeforeUnmount(() => {
  destroyPlayer();
})
</script>

<style>
@import 'plyr/dist/plyr.css';

.video-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Make sure Plyr container is visible */
.plyr__video-wrapper {
  width: 100%;
  height: 100%;
  background: #000;
}

/* Custom Plyr styles */
.plyr--video {
  width: 100%;
  height: 100%;
}

.plyr--full-ui input[type='range'] {
  color: #9333ea !important;
}

.plyr__control--overlaid {
  background: rgba(147, 51, 234, 0.8) !important;
}

.plyr--video .plyr__control:hover {
  background: #9333ea !important;
}

/* Ensure video fills container */
video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Aspect ratio container */
.aspect-video {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
}

.aspect-video > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Add play button styles */
.play-button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.play-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 20px;
  border-radius: 50%;
  transition: transform 0.2s;
}

.play-button:hover {
  transform: scale(1.1);
}

.play-button svg {
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.5));
}

/* Improve video container visibility */
.art-player {
  background: #000;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.art-video-player {
  background: #000 !important;
}
</style>