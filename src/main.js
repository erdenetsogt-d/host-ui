// main.js
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

// Vuetify imports
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// App import
import App from './App.vue'

// Import your view components
import Dashboard from './components/Dashboard.vue'
import HostHistory from './components/HostHistory.vue'
import HostsManagement from './components/HostsManagement.vue'

// Define routes
const routes = [

  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/history', name: 'History', component: HostHistory },
  { path: '/host-mgmt', name: 'HostManagement', component: HostsManagement },
]



// Create Router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
})

// Create Pinia instance
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Use plugins: Pinia, Vuetify, and Router
app.use(pinia)   // Pinia should be installed first
app.use(vuetify)
app.use(router)  // Register Vue Router

// Mount app
app.mount('#app')
