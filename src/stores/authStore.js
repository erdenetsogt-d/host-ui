// src/stores/authStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

const baseUrl = import.meta.env.VITE_BASE_URL

// Create axios instance
const api = axios.create({
  baseURL: baseUrl
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/api/login', credentials)
        const { token, user } = response.data

        // Store token in localStorage and state
        localStorage.setItem('token', token)
        this.token = token
        this.user = user

        // Set default auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      // Clear auth data
      localStorage.removeItem('token')
      this.token = null
      this.user = null
      
      // Remove auth header from both axios instances
      delete api.defaults.headers.common['Authorization']
      delete axios.defaults.headers.common['Authorization']

      // Redirect to login page
      window.location.href = '/'
    },

    async checkAuth() {
      if (!this.token) {
        return false
      }

      try {
        const response = await api.get('/api/validate-token', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        this.user = response.data.user
        return true
      } catch (error) {
        console.error('Token validation error:', error)
        this.logout()
        return false
      }
    },

    clearError() {
      this.error = null
    }
  }
})