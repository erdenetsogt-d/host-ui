<template>
  <div class="history-page">
    <h1>History</h1>
    <p>This is the History page.</p>

    <!-- Search Input -->
    <v-text-field
      v-model="search"
      label="Search"
      class="mb-4"
      prepend-inner-icon="mdi-magnify"
      clearable
    ></v-text-field>

    <v-data-table
      :headers="headers"
      :items="filteredHistory"
      :loading="hostStore.historyLoading"
      class="elevation-1"
      :items-per-page="pageSize"
      hide-default-footer
    >
      <template #item.host_name="{ item }">
        {{ item.host_name }}
      </template>

      <template #item.status="{ item }">
        <v-chip :color="item.status === 'up' ? 'success' : 'error'" class="ma-1">
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.checked_at="{ item }">
        {{ formatDate(item.checked_at) }}
      </template>

      <template #item.alert_status="{ item }">
        <v-icon v-if="item.alert_status" color="red">mdi-alert</v-icon>
        <v-icon v-else color="green">mdi-check-circle</v-icon>
      </template>
    </v-data-table>

    <div class="d-flex justify-end align-center pa-4">
      <v-pagination
        v-if="pageSize !== -1"
        v-model="currentPage"
        :length="hostStore.totalPages"
        @update:model-value="handlePageChange"
        class="mr-4"
      />
      
      <div class="d-flex align-center">
        <span class="mr-2">Rows per page:</span>
        <v-select
          v-model="pageSize"
          :items="pageSizeOptions"
          variant="plain"
          density="compact"
          class="page-size-select"
          hide-details
          @update:model-value="handlePageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useHostStore } from '@/stores/hostStore'
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'HostHistory',
  
  setup() {
    const hostStore = useHostStore()
    const currentPage = ref(1)
    const pageSize = ref(10)
    const search = ref('')

    const pageSizeOptions = [
      { title: '10', value: 10 },
      { title: '50', value: 50 },
      { title: '100', value: 100 },
      { title: 'All', value: -1 }
    ]

    const headers = [
      { title: 'Host Name', key: 'host_name' },
      { title: 'Status', key: 'status' },
      { title: 'Detected', key: 'checked_at' },
      { title: 'Device type', key: 'dev_type' },
      { title: 'Alert Status', key: 'alert_status' }
    ]

    // Filtered history based on search query
    const filteredHistory = computed(() => {
      if (!search.value) {
        return hostStore.hostHistory
      }
      return hostStore.hostHistory.filter(item =>
        item.host_name.toLowerCase().includes(search.value.toLowerCase())
      )
    })

    const handlePageChange = async (page) => {
      await hostStore.fetchHistory(page, pageSize.value)
    }

    const handlePageSizeChange = async (newSize) => {
      currentPage.value = 1
      await hostStore.fetchHistory(1, newSize)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString()
    }

    onMounted(async () => {
      await hostStore.fetchHistory(1, pageSize.value)
    })

    return {
      hostStore,
      headers,
      currentPage,
      pageSize,
      pageSizeOptions,
      search,
      filteredHistory,
      handlePageChange,
      handlePageSizeChange,
      formatDate
    }
  }
}
</script>

<style scoped>
.page-size-select {
  max-width: 80px;
}

:deep(.v-select__selection-text) {
  font-size: 14px;
}

:deep(.v-field__input) {
  min-height: 32px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
