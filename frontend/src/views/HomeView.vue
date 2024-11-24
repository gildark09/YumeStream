<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white font-sans overflow-hidden">
    <!-- Animated background -->
    <div class="absolute inset-0 z-0">
      <div v-for="i in 50" :key="i" 
           class="star"
           :style="{ 
             left: `${Math.random() * 100}%`, 
             top: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 5}s`
           }">
      </div>
    </div>

    <!-- Hero Section with Search -->
    <section class="relative z-10 pt-24 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-6xl font-extrabold mb-6 animate-text-glow">
          Discover Your Next Adventure
        </h2>
        <p class="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
          Explore a universe of anime, from classic masterpieces to the latest sensations.
        </p>
        
        <!-- Search Bar -->
        <div class="max-w-2xl mx-auto mb-16">
          <form @submit.prevent="handleSearch" class="relative group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for your next anime journey..."
              class="w-full py-4 px-6 rounded-full bg-gray-800/50 backdrop-blur-sm
                     text-white placeholder-gray-400 border border-gray-700/50
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50
                     focus:border-transparent transition duration-300
                     group-hover:bg-gray-800/70"
            />
            <button 
              type="submit"
              class="absolute right-2 top-2 bottom-2 px-6
                     bg-gradient-to-r from-purple-600 to-pink-500
                     text-white rounded-full 
                     hover:from-purple-700 hover:to-pink-600
                     transition duration-300 flex items-center
                     group-hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- Trending Section -->
    <section class="relative z-10 px-4 overflow-hidden">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Trending Now
        </h2>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <p class="mt-4 text-gray-400">Loading amazing anime...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <p class="text-red-500">{{ error }}</p>
          <button @click="fetchTrendingAnime" 
                  class="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full hover:from-purple-700 hover:to-pink-600 transition">
            Try Again
          </button>
        </div>

        <!-- Horizontal Scroll for All Screens -->
        <div v-else class="trending-scroll-container">
          <div class="trending-scroll">
            <div v-for="anime in trendingAnime" :key="anime.id" 
                 class="trending-card group">
              <router-link :to="{ name: 'anime-details', params: { id: anime.id }}"
                          class="block">
                <div class="relative overflow-hidden rounded-lg">
                  <img :src="anime.image" :alt="anime.title" 
                       class="w-full h-[400px] object-cover transform group-hover:scale-110 transition duration-500">
                  <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div class="absolute bottom-0 left-0 right-0 p-6">
                    <h3 class="text-xl font-bold mb-2 group-hover:text-purple-400 transition line-clamp-2">
                      {{ anime.title }}
                    </h3>
                    <div class="flex items-center justify-between">
                      <span v-if="anime.totalEpisodes" class="text-sm text-gray-300">
                        EP {{ anime.totalEpisodes }}
                      </span>
                      <button class="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-full 
                                   hover:from-purple-700 hover:to-pink-600 transition duration-300 transform 
                                   hover:scale-105">
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const searchQuery = ref('')
const isLoading = ref(true)
const error = ref('')
const trendingAnime = ref([])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  router.push({
    name: 'search',
    query: { q: searchQuery.value.trim() }
  })
  
  searchQuery.value = ''
}

const fetchTrendingAnime = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await axios.get(`${API_URL}/anime/gogoanime/top-airing`)
    if (response.data && response.data.results) {
      trendingAnime.value = response.data.results.slice(0, 10)
    }
  } catch (err: any) {
    console.error('Error fetching trending anime:', err)
    error.value = err.message || 'Failed to load trending anime'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchTrendingAnime()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700&display=swap');

.font-sans {
  font-family: 'Exo 2', sans-serif;
}

.shadow-neon {
  box-shadow: 0 0 15px rgba(123, 31, 162, 0.5), 0 0 30px rgba(123, 31, 162, 0.3);
}

.animate-text-glow {
  animation: textGlow 2s ease-in-out infinite alternate;
}

@keyframes textGlow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #ff00de, 0 0 35px #ff00de;
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #ff00de, 0 0 70px #ff00de;
  }
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  animation: twinkle 5s infinite;
}

@keyframes twinkle {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.trending-scroll-container {
  overflow: hidden;
  padding: 20px 0;
  margin: 0 -20px;
}

.trending-scroll {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 92, 246, 0.5) rgba(17, 24, 39, 0.5);
}

.trending-card {
  flex: 0 0 300px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease;
}

.trending-card:hover {
  transform: translateY(-5px);
}

/* Custom scrollbar styling */
.trending-scroll::-webkit-scrollbar {
  height: 8px;
}

.trending-scroll::-webkit-scrollbar-track {
  background: rgba(17, 24, 39, 0.5);
  border-radius: 4px;
}

.trending-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 4px;
}

.trending-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
