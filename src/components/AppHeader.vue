<template>
  <v-app-bar color="primary" prominent>
    <v-app-bar-nav-icon @click="handleToggle"></v-app-bar-nav-icon>
    <v-toolbar-title>Host Monitoring System</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn color="success" prepend-icon="mdi-plus" @click="handleAdd" class="mr-4">
      Add Host
    </v-btn>

    <!-- Status Button with dynamic text and color -->
    <!-- <v-btn 
      :color="streamStatus ? 'green' : 'gray'"
      :icon="streamStatus ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
      @click="toggleStatus"
      class="mx-4"
      style="min-width: 130px;"
    >
      {{ streamStatus ? 'CAM PROXY UP' : 'CAM PROXY DOWN' }}
    </v-btn> -->
    
    <!-- User menu with logout -->
    <v-menu location="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn
          color="white"
          icon
          v-bind="props"
        >
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="handleLogout">
          <template v-slot:prepend>
            <v-icon color="red">mdi-logout</v-icon>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
//import { useHostStore } from '@/stores/hostStore'

// Define the events that this component emits
const emit = defineEmits(['toggle-drawer', 'add-host'])

const authStore = useAuthStore()
//const hostStore = useHostStore()

// Get stream status from store
const streamStatus = computed(() => hostStore.streamStatus)

// onMounted(async () => {
//   try {
//     // Check initial stream status when component mounts
//     await hostStore.controlStream('status')
//   } catch (error) {
//     console.error('Error checking stream status:', error)
//   }
// })

const handleToggle = () => {
  console.log("AppHeader: Toggle clicked")
  emit('toggle-drawer')
}

const handleAdd = () => {
  emit('add-host')
}

// const toggleStatus = async () => {
//   try {
//     // Toggle the stream status
//     const command = streamStatus.value ? 'off' : 'on'
//     await hostStore.controlStream(command)
//     console.log("AppHeader: Stream status changed to", hostStore.streamStatus)
//   } catch (error) {
//     console.error('Error toggling stream status:', error)
//   }
// }

const handleLogout = () => {
  console.log("AppHeader: Logout clicked")
  authStore.logout()
}
</script>