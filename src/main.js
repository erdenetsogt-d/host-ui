// main.js
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'

// Vuetify imports
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// App import
import App from './App.vue'

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})

// Create Pinia instance
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Use plugins
app.use(pinia)  // Pinia should be installed first
app.use(vuetify)

// Mount app
app.mount('#app')