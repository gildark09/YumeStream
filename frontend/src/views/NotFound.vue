<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center text-white">
    <div class="text-center">
      <h1 class="text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        404
      </h1>
      <p class="text-xl mb-8 text-gray-300">The page you're looking for doesn't exist.</p>
      <router-link 
        to="/" 
        class="px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition duration-300 inline-block"
      >
        Go to Home
      </router-link>
    </div>
  </div>
</template> 