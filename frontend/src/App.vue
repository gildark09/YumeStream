<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const handleSearch = (e: Event) => {
  e.preventDefault()
  if (!searchQuery.value.trim()) return
  
  router.push({
    name: 'search',
    query: { q: searchQuery.value.trim() }
  })
  
  searchQuery.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Enhanced Header -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Enhanced Logo and Brand -->
          <router-link 
            to="/" 
            class="flex items-center space-x-3 group"
          >
            <div class="relative">
              <img 
                src="/logo.png" 
                alt="YumeStream" 
                class="h-10 w-10 rounded-full transform transition-all duration-300
                       group-hover:scale-110 group-hover:rotate-6"
              />
              <div class="absolute inset-0 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30
                          blur-lg transition-all duration-300 -z-10"></div>
            </div>
            <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                       from-pink-300 via-purple-300 to-indigo-400 
                       group-hover:from-pink-400 group-hover:via-purple-400 group-hover:to-indigo-500 
                       transition-all duration-300">
              YumeStream
            </h1>
          </router-link>

          <!-- Enhanced Search Bar -->
          <form 
            @submit.prevent="handleSearch" 
            class="flex-1 max-w-xl mx-4"
          >
            <div class="relative group">
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Search anime..."
                class="w-full bg-gray-800/50 text-gray-100 rounded-lg pl-10 pr-4 py-2 
                       border border-gray-700/50 focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 focus:border-transparent
                       placeholder-gray-400 transition-all duration-300
                       group-hover:bg-gray-800/70 backdrop-blur-sm"
              />
              <div class="absolute left-3 top-1/2 transform -translate-y-1/2 
                          text-gray-400 group-hover:text-purple-400 
                          transition-colors duration-300">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  class="h-5 w-5"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>
          </form>

          <!-- User Actions (for future use) -->
          <div class="flex items-center space-x-4">
            <button class="p-2 rounded-full hover:bg-gray-800/50 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 hover:text-purple-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button class="p-2 rounded-full hover:bg-gray-800/50 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 hover:text-purple-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-16">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Add these styles for smooth scrolling and base styles */
html {
  scroll-behavior: smooth;
}


/* Gradient animation for logo text */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.router-link-active {
  @apply text-purple-400;
}

/* Search input autofill style override */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px #1f2937 inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-900;
}

::-webkit-scrollbar-thumb {
  @apply bg-purple-500/50 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-purple-500/70;
}

/* Add these new styles */
.hover\:shadow-neon:hover {
  box-shadow: 0 0 15px rgba(123, 31, 162, 0.5),
              0 0 30px rgba(123, 31, 162, 0.3);
}

.group:hover .group-hover\:shadow-neon {
  box-shadow: 0 0 15px rgba(123, 31, 162, 0.5),
              0 0 30px rgba(123, 31, 162, 0.3);
}
</style>
