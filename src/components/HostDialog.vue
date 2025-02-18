<!-- HostDialog.vue -->
<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEdit ? 'Edit Host' : 'New Host' }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Host Name"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formData.ip"
                label="IP Address"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="formData.methodId"
                :items="checkMethods"
                item-title="method"
                item-value="id"
                label="Check Method"
                required
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="formData.alert_channel_name"
                :items="checkAlerts"
                item-title="name"
                item-value="name"
                label="Alert Channel"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="formData.device_type_name"
                :items="checkTypes"
                item-title="device_type"
                item-value="device_type"
                label="Device Type"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="formData.interval"
                label="Check Interval (minutes)"
                type="number"
                min="1"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="formData.num_of_retry"
                label="Number of Retries"
                type="number"
                min="1"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" v-if="showExpectedResponse">
              <v-text-field
                v-model="formData.expected_response"
                label="Expected Response"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="formData.is_active"
                label="Active"
                color="primary"
              ></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          @click="save"
        >
          Save
        </v-btn>
        <v-btn
          color="error"
          variant="text"
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, ref, watch, computed } from 'vue'

export default defineComponent({
  name: 'HostDialog',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    editedItem: {
      type: Object,
      required: true
    },
    checkMethods: {
      type: Array,
      required: true
    },
    checkAlerts: {
      type: Array,
      required: true
    },
    checkTypes: {
      type: Array,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'save', 'close'],

  setup(props, { emit }) {
    const dialog = ref(props.modelValue)
    const formData = ref({ ...props.editedItem })

    const showExpectedResponse = computed(() => {
      const selectedMethod = props.checkMethods.find(method => method.id === formData.value.methodId)
      return selectedMethod?.method === 'HTTP_GET' || selectedMethod?.method === 'HTTP_POST'
    })

    watch(() => props.modelValue, (val) => {
      dialog.value = val
    })

    watch(dialog, (val) => {
      emit('update:modelValue', val)
    })

    watch(() => props.editedItem, (val) => {
      formData.value = { ...val }
    })

    const save = () => {
      console.log(formData.value)
      emit('save', formData.value)
    }

    return {
      dialog,
      formData,
      save,
      showExpectedResponse
    }
  }
})
</script>