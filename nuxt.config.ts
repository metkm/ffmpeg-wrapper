// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    'motion-v/nuxt',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  ssr: false,
  devtools: { enabled: false },
  css: ['~/assets/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  experimental: {
    typedPages: true,
  },
  compatibilityDate: '2024-11-01',
  vite: {
    server: {
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ['**/src-tauri/**'],
      },
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  icon: {
    clientBundle: {
      icons: [
        'lucide:volume-x',
        'lucide:volume',
        'lucide:volume-1',
        'lucide:volume-2',
        'lucide:moon',
        'lucide:sun',
        'lucide:computer',
        'lucide:upload',
        'lucide:chevron-down',
        'lucide:logs',
        'lucide:refresh-cw',
        'lucide:swatch-book',
        'lucide:x',
        'lucide:folder',
        'lucide:folder-symlink',
        'lucide:folder-down',
        'lucide:circle-stop',
        'heroicons:pause-solid',
        'heroicons:play-solid',
      ],
      scan: true,
    },
  },
})
