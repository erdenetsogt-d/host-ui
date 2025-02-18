<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          dismissible
          @click="error = ''"
        >
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="camera in cameras"
        :key="camera.id"
        cols="12"
        sm="6"
        md="4"
        lg="4"
      >
        <v-card>
          <v-card-title class="d-flex flex-wrap">
            <span class="text-truncate">{{ camera.name }}</span>
            <v-spacer></v-spacer>

            <!-- Toggle button to start/stop stream -->
            <v-btn
              color="primary"
              size="small"
              @click="toggleStream(camera)"
              :loading="streamStates[camera.id]?.isConnecting"
            >
              <v-icon size="small">
                {{ streamStates[camera.id]?.isStreaming ? 'mdi-camera-off' : 'mdi-camera' }}
              </v-icon>
              {{ streamStates[camera.id]?.isStreaming ? 'Stop' : 'Start' }}
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="streamStates[camera.id]?.error"
              type="error"
              density="compact"
              class="mb-4"
              dismissible
              @click="streamStates[camera.id].error = ''"
            >
              {{ streamStates[camera.id].error }}
            </v-alert>

            <video
              :ref="el => { if (el) videoRefs[camera.id] = el }"
              class="camera-feed"
              :class="{ 'hidden': !streamStates[camera.id]?.isStreaming }"
              autoplay
              playsInline
              muted
              controls
              @error="(e) => handleVideoError(e, camera.id)"
            ></video>
            
            <div v-if="!streamStates[camera.id]?.isStreaming && !streamStates[camera.id]?.isConnecting" class="text-center pa-4">
              <v-icon size="64" color="grey">mdi-camera-off</v-icon>
              <div class="text-subtitle-2 grey--text text-wrap">
                {{ streamStates[camera.id]?.error || 'Camera is offline' }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { useHostStore } from '@/stores/hostStore'  // Import the store

// Initialize the store
const hostStore = useHostStore()

// State
const cameras = ref([])
const error = ref('')
const videoRefs = reactive({})
const streamStates = reactive({})
const peerConnections = reactive({})
const connectionTimeouts = reactive({})

// Fetch cameras from hostStore
const fetchCameras = async () => {
  try {
    await hostStore.fetchCameras()  // Call the store's fetchCameras method
    cameras.value = hostStore.cameras.slice(0, 9) // Limit to maximum 9 cameras
    
    cameras.value.forEach(camera => {
      streamStates[camera.id] = {
        isStreaming: false,
        isConnecting: false,
        error: ''
      }
    })
  } catch (e) {
    error.value = `Failed to fetch cameras: ${e.message}`
  }
}

// Handle toggle action for start/stop stream
const toggleStream = async (camera) => {
  if (streamStates[camera.id]?.isStreaming) {
    stopStream(camera.id)
  } else {
    await startStream(camera)
  }
}

// Start the stream
const startStream = async (camera) => {
  try {
    stopStream(camera.id) // Clear any existing connections
    streamStates[camera.id].isConnecting = true
    streamStates[camera.id].error = ''
    
    peerConnections[camera.id] = createPeerConnection(camera.id)

    connectionTimeouts[camera.id] = setTimeout(() => {
      if (!streamStates[camera.id].isStreaming) {
        streamStates[camera.id].error = 'Connection timeout. Please try again.'
        stopStream(camera.id)
      }
    }, 10000)

    try {
      const offer = await peerConnections[camera.id].createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      })

      await peerConnections[camera.id].setLocalDescription(offer)

      const response = await fetch(camera.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp'
        },
        body: offer.sdp
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const answerSDP = await response.text()
      
      if (!answerSDP.trim().startsWith('v=')) {
        throw new Error('Invalid SDP format received')
      }

      await peerConnections[camera.id].setRemoteDescription({
        type: 'answer',
        sdp: answerSDP
      })

    } catch (error) {
      throw new Error(`WebRTC negotiation failed: ${error.message}`)
    }

  } catch (error) {
    console.error(`Stream connection error for camera ${camera.id}:`, error)
    streamStates[camera.id].error = `Failed to connect: ${error.message}`
    stopStream(camera.id)
  }
}

// Stop the stream
const stopStream = (cameraId) => {
  if (connectionTimeouts[cameraId]) {
    clearTimeout(connectionTimeouts[cameraId])
    delete connectionTimeouts[cameraId]
  }

  if (peerConnections[cameraId]) {
    try {
      peerConnections[cameraId].close()
    } catch (error) {
      console.error(`Error closing peer connection for camera ${cameraId}:`, error)
    }
    delete peerConnections[cameraId]
  }
  
  if (videoRefs[cameraId]?.srcObject) {
    try {
      const tracks = videoRefs[cameraId].srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRefs[cameraId].srcObject = null
    } catch (error) {
      console.error(`Error stopping video tracks for camera ${cameraId}:`, error)
    }
  }
  
  streamStates[cameraId].isStreaming = false
  streamStates[cameraId].isConnecting = false
}

// Create a peer connection
const createPeerConnection = (cameraId) => {
  const pc = new RTCPeerConnection({
    sdpSemantics: 'unified-plan'
  })

  pc.addTransceiver('video', {
    direction: 'recvonly',
    sendEncodings: [
      {
        rid: 'h',
        maxBitrate: 5000000,
        maxFramerate: 30
      }
    ]
  })
  pc.addTransceiver('audio', { direction: 'recvonly' })
  
  pc.ontrack = (event) => {
    if (videoRefs[cameraId] && event.streams[0]) {
      videoRefs[cameraId].srcObject = event.streams[0]
      streamStates[cameraId].isStreaming = true
      streamStates[cameraId].isConnecting = false
    }
  }

  pc.onconnectionstatechange = () => {
    console.log(`Camera ${cameraId} connection state:`, pc.connectionState)
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      streamStates[cameraId].error = 'Connection lost. Please try reconnecting.'
      stopStream(cameraId)
    }
  }

  return pc
}

// Handle video element error
const handleVideoError = (error, cameraId) => {
  console.error(`Video element error for camera ${cameraId}:`, error)
  streamStates[cameraId].error = 'Error playing video stream: ' + (error.message || 'Unknown error')
  stopStream(cameraId)
}

// Lifecycle hooks
onMounted(() => {
  fetchCameras()
})

onUnmounted(() => {
  // Clean up all streams
  Object.keys(streamStates).forEach(cameraId => {
    stopStream(Number(cameraId))
  })
})
</script>

<style scoped>
.camera-feed {
  width: 100%;
  aspect-ratio: 16/9;
  margin: 0 auto;
  display: block;
  background: #000;
}
.hidden {
  display: none;
}
</style>
