<!-- DeleteDialog.vue -->
<template>
  <v-dialog
    v-model="dialog"
    max-width="400px"
  >
    <v-card>
      <v-card-title class="text-h5">Delete Host</v-card-title>
      <v-card-text>
        Are you sure you want to delete host "{{ host?.name }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          @click="$emit('confirm')"
        >
          Delete
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="dialog = false"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'DeleteDialog',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    host: {
      type: Object,
      required: true,
      validator: (value) => value !== null && typeof value === 'object'
    }
  },

  emits: ['update:modelValue', 'confirm'],

  setup(props, { emit }) {
    const dialog = ref(props.modelValue)

    watch(() => props.modelValue, (val) => {
      dialog.value = val
    })

    watch(dialog, (val) => {
      emit('update:modelValue', val)
    })

    return {
      dialog
    }
  }
})
</script>