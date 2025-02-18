<!-- AppSidebar.vue -->
<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    color="grey-lighten-4"
  >
    <v-list>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :value="item.value"
        :title="item.title"
        :prepend-icon="item.icon"
        :active="currentView === item.value"
        @click="handleClick(item.value)"
      >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'AppSidebar',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    currentView: {
      type: String,
      required: true
    }
  },

  emits: ['update:modelValue', 'update:currentView'],

  setup(props, { emit }) {
    const drawer = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    const menuItems = [
      {
        title: 'Dashboard',
        value: 'dashboard',
        icon: 'mdi-view-dashboard'
      },
      {
        title: 'Hosts Management',
        value: 'hosts',
        icon: 'mdi-server'
      },
      {
        title: 'History',
        value: 'history',
        icon: 'mdi-history'
      }
    ]

    const handleClick = (value) => {
      emit('update:currentView', value)
    }

    return {
      drawer,
      menuItems,
      handleClick
    }
  }
})
</script>