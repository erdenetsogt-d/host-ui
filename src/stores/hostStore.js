// src/stores/hostStore.js
import { defineStore } from 'pinia'
import axios from 'axios'

const baseUrl = import.meta.env.VITE_BASE_URL

// Create axios instance with default config
const api = axios.create({
  baseURL: baseUrl
})

// Add request interceptor to inject auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export const useHostStore = defineStore('host', {
  state: () => ({
    hosts: [],
    hostHistory: [],
    totalPages: 1,
    currentPage: 1,
    checkMethods: [],
    checkAlerts: [],
    checkTypes: [],
    loading: false,
    historyLoading: false,
    error: null,
    // Add camera-related state
    cameras: [],
    cameraLoading: false,
    streamStatus: false,  
    

  }),

  getters: {
    // Add camera getter with 9 camera limit
    getCameras: (state) => state.cameras.slice(0, 9)
  },

  actions: {
    // Existing actions...
    async fetchHosts() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/api/hosts')
        this.hosts = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch hosts'
        console.error('Error fetching hosts:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchHistory(page = 1, limit = 10) {
      this.historyLoading = true
      this.error = null
      try {
        const params = limit === -1 
          ? { page: 1, limit: 999999 }
          : { page, limit }

        const response = await api.get('/api/host-history', { params })
        const data = response.data

        this.hostHistory = data.data
        this.totalRecords = data.total
        this.totalPages = limit === -1 ? 1 : data.totalPages
        this.currentPage = data.page

      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch history'
        console.error('Error fetching history:', error)
        throw error
      } finally {
        this.historyLoading = false
      }
    },

    async fetchCheckMethods() {
      this.error = null
      try {
        const response = await api.get('/api/check-method')
        this.checkMethods = response.data.map(item => ({
          id: item.ID,
          method: item.Method.toUpperCase()
        }))
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch check methods'
        console.error('Error fetching check methods:', error)
        throw error
      }
    },

    async fetchCheckAlerts() {
      this.error = null
      try {
        const response = await api.get('/api/check-alert')
        this.checkAlerts = response.data.map(item => ({
          id: item.ID,
          name: item.name
        }))

      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch check alerts'
        console.error('Error fetching check alerts:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCheckTypes() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/api/devtype')
        this.checkTypes = response.data.map(item => ({
          id: item.ID,
          device_type: item.device_type
        }))

      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch types'
        console.error('Failed to fetch types:', error)
        throw error
      }
    },

    async save(formData) {
      this.error = null
      try {
        const payload = {
          ID: formData.ID,
          name: formData.name,
          ip: formData.ip,
          methodId: Number(formData.methodId),
          alert_channel_name: formData.alert_channel_name,
          interval: Number(formData.interval),
          num_of_retry: Number(formData.num_of_retry),
          expected_response: formData.expected_response ? Number(formData.expected_response) : null,
          is_active: Boolean(formData.is_active),
          updated_at: formData.updated_at,
          device_type_name: formData.device_type_name,
          alert_status: Boolean(formData.alert_status),
          is_pending: Boolean(formData.is_pending),
          retry_count: Number(formData.retry_count || 0)
        }

        if (payload.ID) {
          const response = await api.put(`/api/hosts/${payload.ID}`, payload)
          const hostIndex = this.hosts.findIndex(h => h.ID === payload.ID)
          if (hostIndex !== -1) {
            this.hosts[hostIndex] = {
              ...response.data,
              ...payload
            }
          }
        } else {
          const response = await api.post('/api/hosts', payload)
          this.hosts.push(response.data)
        }

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to save host'
        console.error('Error saving host:', error)
        throw error
      }
    },

    async deleteHost(id) {
      this.error = null
      try {
        await api.delete(`/api/hosts/${id}`)
        await this.fetchHosts()
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete host'
        console.error('Error deleting host:', error)
        throw error
      }
    },

    // Add camera-related action
    async fetchCameras() {
      this.cameraLoading = true
      this.error = null
      try {
        const response = await api.get('/api/get-cameras')
        this.cameras = response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch cameras'
        console.error('Error fetching cameras:', error)
        throw error
      } finally {
        this.cameraLoading = false
      }
    },
    async controlStream(command) {
      this.error = null
      try {
        const response = await api.post('/api/controlStream', { command })
        // Assuming the response contains the 'status' as { status: true }
        if (response.data.status !== undefined) {
          this.streamStatus = response.data.status
        }
        return response.data.status
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to control stream'
        console.error('Error controlling stream:', error)
        throw error
      }
    },


    clearError() {
      this.error = null
    }
  }
})