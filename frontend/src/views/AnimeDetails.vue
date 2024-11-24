<template>
    <div class="min-h-screen text-white font-sans bg-gray-900">
      <div v-if="animeInfo" class="container mx-auto px-4 py-8">
        <div class="anime-header bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div class="grid md:grid-cols-[300px,1fr] gap-8 p-6">
            <img :src="animeInfo.image" 
                 :alt="animeInfo.title"
                 class="w-full h-[400px] object-cover rounded-lg">
            <div class="anime-info space-y-4">
              <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {{ animeInfo.title }}
              </h1>
              <p class="text-gray-300">{{ animeInfo.description }}</p>
              <div class="meta-info flex flex-wrap gap-4">
                <span class="px-3 py-1 bg-purple-600 rounded-full text-sm">
                  Status: {{ animeInfo.status }}
                </span>
                <span class="px-3 py-1 bg-pink-600 rounded-full text-sm">
                  Released: {{ animeInfo.releaseDate }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="episodes-list mt-8">
          <h2 class="text-2xl font-bold mb-6 text-purple-400">Episodes</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <router-link 
              v-for="episode in animeInfo.episodes" 
              :key="episode.id"
              :to="{ name: 'watch', params: { episodeId: episode.id }}"
              class="episode-card"
            >
              Episode {{ episode.number }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="flex items-center justify-center min-h-screen">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchAnimeInfo" 
                class="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition">
          Try Again
        </button>
      </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { AnimeDetails } from '@/types/anime'
  
const route = useRoute()
const animeInfo = ref<AnimeDetails | null>(null)
const isLoading = ref(true)
const error = ref('')

const API_URL = 'https://apiconsumetorg-zeta.vercel.app'
  
const fetchAnimeInfo = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await axios.get(`${API_URL}/anime/gogoanime/info/${route.params.id}`)
    if (response.data) {
      animeInfo.value = response.data
    }
  } catch (err) {
    console.error('Error fetching anime info:', err)
    error.value = 'Failed to load anime information. Please try again later.'
  } finally {
    isLoading.value = false
  }
}
  
onMounted(() => {
  fetchAnimeInfo()
})
</script>
  
<style scoped>
.episode-card {
  @apply bg-gray-800 hover:bg-gray-700 p-4 rounded-lg 
         text-center transition duration-300 hover:scale-105;
}

.episode-card:hover {
  box-shadow: 0 0 15px rgba(123, 31, 162, 0.5),
              0 0 30px rgba(123, 31, 162, 0.3);
}
</style>