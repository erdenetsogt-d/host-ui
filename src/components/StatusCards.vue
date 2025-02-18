// src/components/StatusCards.vue
<template>
  <v-row>
    <v-col cols="12" md="3" v-for="(stat, index) in statistics" :key="index">
      <v-card class="mx-auto" max-width="400" :color="stat.color" dark>
        <v-card-text>
          <div class="text-h4 text-center">{{ stat.value }}</div>
          <div class="text-subtitle-1 text-center">{{ stat.title }}</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StatusCards',
  props: {
    hosts: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  setup(props) {
    // Add this to debug

    const statistics = computed(() => [
      {
        title: 'Total Hosts',
        value: props.hosts.length || 0,
        color: 'primary'
      },
      {
        title: 'Down Hosts',
        value: props.hosts.filter(h => h.alert_status).length || 0,
        color: 'error'
      },
      {
        title: 'Up Hosts',
        value: props.hosts.filter(h => !h.alert_status && !h.is_pending).length || 0,
        color: 'success'
      },
      {
        title: 'Pending Hosts',
        value: props.hosts.filter(h => h.is_pending && !h.alert_status).length || 0,
        color: 'warning'
      }
    ])

    return { statistics }
  }
}
</script>