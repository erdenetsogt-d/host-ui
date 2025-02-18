<template>
    <v-card class="elevation-12">
      <v-card-title class="text-center text-h5 py-4">
        Login
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="form">
          <v-text-field
            v-model="username"
            :rules="[v => !!v || 'Username is required']"
            label="Username"
            prepend-icon="mdi-account"
            variant="outlined"
            required
          />
  
          <v-text-field
            v-model="password"
            :rules="[v => !!v || 'Password is required']"
            label="Password"
            prepend-icon="mdi-lock"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            required
          />
  
          <div class="d-flex flex-column gap-4">
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              closable
            >
              {{ error }}
            </v-alert>
  
            <v-btn
              color="primary"
              size="large"
              block
              type="submit"
              :loading="loading"
            >
              Sign In
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </template>
  
  <script>
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/authStore'
  
  export default {
    name: 'Login',
    setup() {
      const authStore = useAuthStore()
      const username = ref('')
      const password = ref('')
      const showPassword = ref(false)
      const form = ref(null)
      const error = ref('')
      const loading = ref(false)
  
      const handleLogin = async () => {
        if (!form.value) return
        
        const { valid } = await form.value.validate()
        if (!valid) return
  
        loading.value = true
        error.value = ''
  
        try {
          await authStore.login({
            username: username.value,
            password: password.value
          })
        } catch (err) {
          error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
          console.error('Login error:', err)
        } finally {
          loading.value = false
        }
      }
  
      return {
        username,
        password,
        showPassword,
        form,
        error,
        loading,
        handleLogin
      }
    }
  }
  </script>