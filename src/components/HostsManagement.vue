<!-- HostsManagement.vue -->
<template>
  <div class="host-management-page">
    <h1>Host Management</h1>
    <p>This is the Host Management page.</p>
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
          <tr>
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
import { ref, computed } from 'vue'

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
    const headers = [
      { title: 'Host Name', key: 'name', align: 'start' },
      { title: 'IP/URL', key: 'ip', align: 'start' },
      { title: 'Status', key: 'status', align: 'center' },
      { title: 'Last Checked', key: 'last_checked_date', align: 'center' },
      { title: 'Interval (min)', key: 'interval', align: 'center' },
      { title: 'Check Method', key: 'methodName', align: 'center' },
      { title: 'Alert channel', key: 'alert_channel_name', align: 'center' },
      { title: 'Actions', key: 'actions', align: 'center', sortable: false }
    ]

    const getStatusColor = (item) => {
      if (!item) return 'gray'
      return item.alert_status ? 'error' : 
             item.is_pending ? 'warning' : 'success'
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

    return {
      headers,
      getStatusColor,
      getStatusText,
      getMethodName,
      formatDate
    }
  }
}
</script>