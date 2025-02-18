<!-- HostsManagement.vue -->
<template>
  <div class="host-management-page">
    <div class="d-flex align-center mb-4">
      <h1>Host Management</h1>
      <v-btn
        icon
        class="ml-4"
        @click="refreshHosts"
        :loading="loading"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </div>

    <v-card>
      <v-card-title>
        <v-text-field
          :model-value="search"
          @update:model-value="$emit('update:search', $event)"
          prepend-icon="mdi-magnify"
          label="Search Hosts"
          single-line
          hide-details
          outlined
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="hosts"
        :search="search"
        :loading="loading"
        item-value="name"
        class="elevation-1"
      >
        <template v-slot:item="{ item }">
          <tr :class="{
            'bg-red-50': item.alert_status,
            'bg-green-50': !item.alert_status && !item.is_pending,
            'bg-yellow-50': item.is_pending
          }">
            <td>{{ item.name }}</td>
            <td>{{ item.ip }}</td>
            <td>
              <v-chip
                :color="getStatusColor(item)"
                :text="getStatusText(item)"
                class="ma-1"
              ></v-chip>
            </td>
            <td>{{ formatDate(item.last_checked_date) }}</td>
            <td>{{ item.interval }}</td>
            <td>{{ getMethodName(item.methodId) }}</td>
            <td>{{ item.alert_channel_name }}</td>
            <td>{{ calculateTimeSinceLastAlert(item) }}</td>
            <td>
              <v-btn
                icon="mdi-pencil"
                size="small"
                color="primary"
                @click="$emit('editHost', item)"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                color="error"
                class="ml-2"
                @click="$emit('deleteHost', item)"
              ></v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHostStore } from '@/stores/hostStore'

export default {
  name: 'HostsManagement',

  props: {
    hosts: {
      type: Array,
      required: true,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    checkMethods: {
      type: Array,
      required: true,
      default: () => []
    },
    search: {
      type: String,
      default: ''
    }
  },

  emits: ['editHost', 'deleteHost', 'update:search'],

  setup(props) {
    const hostStore = useHostStore()
    
    const refreshHosts = async () => {
      await hostStore.fetchHosts({ search: props.search })
    }

    const headers = [
      { title: 'Host Name', key: 'name', align: 'start' },
      { title: 'IP/URL', key: 'ip', align: 'start' },
      { title: 'Status', key: 'status', align: 'center' },
      { title: 'Last Checked', key: 'last_checked_date', align: 'center' },
      { title: 'Interval (min)', key: 'interval', align: 'center' },
      { title: 'Check Method', key: 'methodName', align: 'center' },
      { title: 'Alert channel', key: 'alert_channel_name', align: 'center' },
      { title: 'Time Since Last Alert', key: 'time_since_alert', align: 'center' },
      { title: 'Actions', key: 'actions', align: 'center', sortable: false }
    ]

    const calculateTimeSinceLastAlert = (item) => {
      if (!item) return 'N/A'
      
      const timeToCheck = item.alert_status ? item.last_alert : item.last_normal
      if (!timeToCheck) return 'N/A'
      
      const lastDate = new Date(timeToCheck)
      const now = new Date()
      const diffInMinutes = Math.floor((now - lastDate) / (1000 * 60))
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes`
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60)
        const minutes = diffInMinutes % 60
        return `${hours}h ${minutes}m`
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        const hours = Math.floor((diffInMinutes % 1440) / 60)
        return `${days}d ${hours}h`
      }
    }

    const getStatusColor = (item) => {
      if (!item) return 'gray'
      return item.alert_status ? 'error' :
             item.is_pending ? 'warning' : 'success'
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          hostStore.fetchCheckAlerts(),
          hostStore.fetchCheckMethods(),
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    const getStatusText = (item) => {
      if (!item) return 'Unknown'
      return item.alert_status ? 'Down' :
             item.is_pending ? 'Pending' : 'Up'
    }

    const getMethodName = (methodId) => {
      if (!methodId) return ''
      const method = props.checkMethods.find(m => m.id === methodId)
      return method ? method.method : ''
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString()
    }

    // Reference to store the interval
    let refreshInterval = null

    onMounted(async () => {
      // Initial fetch
      await hostStore.fetchHosts()
      
      // Set up auto-refresh every 2 minutes (120000 milliseconds)
      refreshInterval = setInterval(async () => {
        await refreshHosts()
      }, 120000)
    })

    // Clean up the interval when component unmounts
    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      headers,
      getStatusColor,
      getStatusText,
      getMethodName,
      formatDate,
      refreshHosts,
      hostStore,
      fetchData,
      calculateTimeSinceLastAlert
    }
  }
}
</script>

<style scoped>
.host-management-page {
  padding: 16px;
}

.bg-red-50 {
  background-color: rgba(228, 111, 111, 0.8) !important;
}

.bg-green-50 {
  background-color: rgba(236, 253, 245, 0.8) !important;
}

.bg-yellow-50 {
  background-color: rgba(254, 252, 232, 0.8) !important;
}

/* Override v-data-table hover effect */
.v-data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
}
</style>