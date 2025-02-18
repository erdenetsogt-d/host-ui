<template>
  <v-row>
    <v-col 
      v-for="(stat, index) in statistics" 
      :key="index" 
      :cols="dynamicColWidth"
    >
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
    checkTypes: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  setup(props) {
    const statistics = computed(() => {
      const grouped = props.checkTypes.reduce((acc, item) => {
        if (!acc[item.device_type]) {
          acc[item.device_type] = { count: 0, color: 'primary' }
        }
        acc[item.device_type].count++
        return acc
      }, {})

      return Object.keys(grouped).map(type => ({
        title: type,
        value: grouped[type].count,
        color: grouped[type].color
      }))
    })

    // Dynamic column width
    const dynamicColWidth = computed(() => {
      const totalCards = statistics.value.length
      if (totalCards <= 2) return 6 // Two cards per row
      if (totalCards <= 3) return 4 // Three cards per row
      if (totalCards <= 4) return 3 // Four cards per row
      return 2 // More cards, reduce column width
    })

    return { statistics, dynamicColWidth }
  }
}
</script>
