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

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center px-4">
      <div class="max-w-3xl text-center">
        <h1 class="text-5xl font-extrabold mb-8 animate-text-glow">
          About YumeStream
        </h1>
        
        <div class="space-y-6 text-lg text-gray-300">
          <p class="leading-relaxed">
            YumeStream is your premier destination for anime streaming, offering a vast collection
            of titles from classics to the latest releases. Our platform is designed to provide
            the best possible viewing experience for anime enthusiasts.
          </p>
          
          <p class="leading-relaxed">
            We're committed to delivering high-quality streams, an intuitive interface, and
            a seamless watching experience. Whether you're a casual viewer or a dedicated fan,
            YumeStream is your gateway to the world of anime.
          </p>

          <div class="flex flex-wrap justify-center gap-4 mt-8">
            <router-link 
              to="/" 
              class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full
                     hover:from-purple-700 hover:to-pink-600 transition duration-300 transform
                     hover:scale-105 hover:shadow-neon"
            >
              Start Watching
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
