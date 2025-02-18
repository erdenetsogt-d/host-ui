<template>
  <div>
    <StatusCards :checkTypes="checkTypes" />

    <v-card class="mt-4">
      <v-card-title>

      </v-card-title>


    </v-card>

    <!-- Add HostHistory Component Below -->
    <HostHistory class="mt-4" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import StatusCards from './StatusCards.vue'
import HostHistory from '@/components/HostHistory.vue' // Import HostHistory

export default {
  name: 'Dashboard',
  components: {
    StatusCards,
    HostHistory // Register HostHistory
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    checkTypes: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>
