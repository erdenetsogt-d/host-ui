import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import HostHistory from './components/HostHistory.vue'
import HostsManagement from './components/HostsManagement.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/host-mgmt', name: 'HostsManagement', component: HostsManagement },
  { path: '/history', name: 'History', component: HostHistory },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
