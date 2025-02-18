<!-- App.vue -->
<template>
  <v-app>
    <!-- Debug info -->
    <div v-if="isDev" class="pa-4">
      <p>Auth Status: {{ isAuthenticated }}</p>
    </div>

    <template v-if="!isAuthenticated">
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <Login />
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-else>
      <AppSidebar 
        v-model="drawer" 
        :current-view="currentView"
        @update:currentView="currentView = $event"
      />
      <AppHeader 
        :drawer="drawer" 
        @toggle-drawer="drawer = !drawer"
        @add-host="openAddHostDialog"
        @logout="handleLogout"
      />
      <v-main>
        <v-container fluid>
          <Dashboard 
            v-if="currentView === 'dashboard'"
            :hosts="hosts"
            :loading="loading"
            :check-methods="checkMethods"
            :search="search"
            @edit-host="editHost"
            @delete-host="deleteHost"
            @update:search="search = $event"
          />
          <HostsManagement 
            v-else-if="currentView === 'hosts'"
            :hosts="hosts"
            :loading="loading"
            :search="search"
            @edit-host="editHost"
            @delete-host="deleteHost"
            @update:search="search = $event"
          />
          <HostHistory 
            v-else-if="currentView === 'history'"
            :host-history="hostHistory"
            :loading="historyLoading"
          />
        </v-container>
      </v-main>
    </template>

    <!-- Dialogs -->
    <HostDialog
      v-if="isAuthenticated"
      v-model="dialog"
      :edited-item="editedItem"
      :check-methods="checkMethods"
      :check-alerts="checkAlerts"
      :check-types="checkTypes"
      :is-edit="editedIndex !== -1"
      @save="saveHost"
      @close="closeDialog"
    />
    <DeleteDialog
      v-if="isAuthenticated && hostToDelete"
      v-model="deleteDialog"
      :host="hostToDelete"
      @confirm="confirmDelete"
    />
  </v-app>
</template>

<script>
// Order of imports matters to prevent initialization issues
import { defineComponent } from 'vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useHostStore } from '@/stores/hostStore'
import { useAuthStore } from '@/stores/authStore'

// Component imports
import Login from '@/components/Login.vue'
import Dashboard from '@/components/Dashboard.vue'
import HostHistory from '@/components/HostHistory.vue'
import HostsManagement from '@/components/HostsManagement.vue'
import HostDialog from '@/components/HostDialog.vue'
import DeleteDialog from '@/components/DeleteDialog.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'

export default defineComponent({
  name: 'App',

  components: {
    Login,
    Dashboard,
    HostHistory,
    HostsManagement,
    HostDialog,
    DeleteDialog,
    AppHeader,
    AppSidebar
  },

  setup() {
    const hostStore = useHostStore()
    const authStore = useAuthStore()
    const loading = ref(false)
    const drawer = ref(false)
    const currentView = ref('dashboard')
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const search = ref('')
    const editedIndex = ref(-1)
    const hostToDelete = ref(null)
    const isDev = ref(import.meta.env.DEV)

    const editedItem = ref({
      name: '',
      ip: '',
      methodId: null,
      alert_channel_name: null,
      device_type_name: null,
      interval: 1,
      num_of_retry: 3,
      expected_response: null,
      is_active: true,
      alertStatus: false,
      isPending: false,
      device_type_name: null,
    })

    onMounted(async () => {
      loading.value = true
      try {
        console.log('App mounted, checking auth...')
        await authStore.checkAuth()
        console.log('Auth status:', authStore.isAuthenticated)
        
        if (authStore.isAuthenticated) {
          console.log('User is authenticated, fetching data...')
          await fetchData()
        }
      } catch (error) {
        console.error('Error during initialization:', error)
      } finally {
        loading.value = false
      }
    })

    const fetchData = async () => {
      try {
        await Promise.all([
          hostStore.fetchHosts(),
          hostStore.fetchHistory(),
          hostStore.fetchCheckMethods(),
          hostStore.fetchCheckAlerts(),
          hostStore.fetchCheckTypes()
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    watch(() => authStore.isAuthenticated, async (newValue) => {
      console.log('Auth status changed:', newValue)
      if (newValue) {
        await fetchData()
      }
    })

    const handleLogout = () => {
      authStore.logout()
    }

    const editHost = (item) => {
      editedIndex.value = hostStore.hosts.indexOf(item)
      editedItem.value = { ...item }
      dialog.value = true
    }

    const deleteHost = (item) => {
      hostToDelete.value = item
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      await hostStore.deleteHost(hostToDelete.value.ID)
      deleteDialog.value = false
      hostToDelete.value = null
    }

    const saveHost = async (item) => {
      await hostStore.save(item)
      closeDialog()
    }

    const closeDialog = () => {
      dialog.value = false
      editedIndex.value = -1
      editedItem.value = {
        name: '',
        ip: '',
        methodId: null,
        alert_channel_name: null,
        device_type_name: null,
        interval: 1,
        num_of_retry: 3,
        expected_response: null,
        is_active: true,
        alertStatus: false,
        isPending: false
      }
    }

    const openAddHostDialog = () => {
      editedIndex.value = -1
      editedItem.value = {
        name: '',
        ip: '',
        methodId: null,
        alert_channel_name: null,
        device_type_name: null,
        interval: 1,
        num_of_retry: 3,
        expected_response: null,
        is_active: true,
        isPending: false
      }
      dialog.value = true
    }

    return {
      drawer,
      currentView,
      dialog,
      deleteDialog,
      search,
      editedItem,
      editedIndex,
      hostToDelete,
      loading,
      isDev,
      isAuthenticated: computed(() => authStore.isAuthenticated),
      hosts: computed(() => hostStore.hosts),
      checkTypes: computed(() => hostStore.checkTypes),
      hostHistory: computed(() => hostStore.hostHistory),
      checkMethods: computed(() => hostStore.checkMethods),
      checkAlerts: computed(() => hostStore.checkAlerts),
      historyLoading: computed(() => hostStore.historyLoading),

      handleLogout,
      editHost,
      deleteHost,
      confirmDelete,
      saveHost,
      closeDialog,
      openAddHostDialog
    }
  }
})
</script>