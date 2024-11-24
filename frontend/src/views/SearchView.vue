<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white font-sans">
    <div class="container mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold mb-8">
        Search Results for "{{ searchQuery }}"
      </h2>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="performSearch" 
                class="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition">
          Try Again
        </button>
      </div>

      <!-- Results Grid -->
      <div v-else-if="results.length > 0" 
           class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="anime in results" 
             :key="anime.id" 
             class="bg-gray-800 rounded-lg overflow-hidden hover:shadow-neon transition duration-300">
          <router-link :to="{ name: 'anime-details', params: { id: anime.id }}">
            <div class="relative aspect-[3/4]">
              <img :src="anime.image" 
                   :alt="anime.title"
                   class="w-full h-full object-cover"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div class="absolute bottom-0 left-0 right-0 p-4">
                  <h3 class="text-lg font-semibold line-clamp-2">{{ anime.title }}</h3>
                  <p v-if="anime.releaseDate" class="text-sm text-gray-300 mt-1">
                    {{ anime.releaseDate }}
                  </p>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-20">
        <p class="text-gray-400">No results found for "{{ searchQuery }}"</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchAnime } from '@/services/searchService'

const route = useRoute()
const searchQuery = ref('')
const results = ref([])
const isLoading = ref(false)
const error = ref('')

const performSearch = async () => {
  if (!searchQuery.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const data = await searchAnime(searchQuery.value)
    results.value = data.results || []
  } catch (err: any) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Watch for route query changes
watch(() => route.query.q, (newQuery) => {
  if (newQuery) {
    searchQuery.value = newQuery as string
    performSearch()
  }
}, { immediate: true })
</script>

<style scoped>
.hover\:shadow-neon:hover {
  box-shadow: 0 0 15px rgba(123, 31, 162, 0.5),
              0 0 30px rgba(123, 31, 162, 0.3);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 