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
        @click="handleClick(item)"
      >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'

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
    const router = useRouter()

    const drawer = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    })

    // Added a route property to each menu item.
    const menuItems = [
      {
        title: 'Dashboard',
        value: 'dashboard',
        icon: 'mdi-view-dashboard',
        route: '/' // Update as needed
      },
      {
        title: 'Hosts Management',
        value: 'hosts',
        icon: 'mdi-server',
        route: '/host-mgmt'
      },
      {
        title: 'History',
        value: 'history',
        icon: 'mdi-history',
        route: '/history'
      }
    ]

    const handleClick = (item) => {
      emit('update:currentView', item.value)
      router.push(item.route)
    }

    return {
      drawer,
      menuItems,
      handleClick
    }
  }
})
</script>
