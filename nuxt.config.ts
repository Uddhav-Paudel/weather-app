// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr:true,
  nitro: {
    prerender: {
      concurrency: 250,
      interval: 100,
    }
  },  
  /* devServer: {
    https: {
      key:'./localhost-key.pem',
      cert:'./localhost.pem'
    },
  }, */
  devtools: { enabled: false },
  modules: [
    "@pinia/nuxt",
    "vuetify-nuxt-module",
    "@nuxt/image",
    "@vueuse/nuxt",
    "@vite-pwa/nuxt"
  ],
  css:[
    '~/assets/css/main.scss',
  ],
  app:{
    head:{
      title: 'Weather | Forecast',
      link:[
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Weather App' }
      ],
    }
  },
  imports: {
    autoImport: true,
  },
  pwa:{
    client: {
      installPrompt: true,
    },/* 
    workbox: {
      // Workbox options
      // Example: adjust caching strategies
      // More options: https://pwa.nuxtjs.org/modules/workbox
      runtimeCaching: [
        {
          urlPattern: '/*',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'my-cache',
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    }, */
    manifest:{
      name:'Weather App',
      short_name: "Weather App",
      description:'Opensource weather api implementation sample.',
      display:'standalone',
      background_color:'#FFFFFF',
      start_url: "/",
      theme_color: "#317EFB",
      icons:[
        {
          src:'/favicon.svg',
          sizes:'any',
          type:'image/svg+xml'
        }
      ]

    },
    
    
  },
  
});
