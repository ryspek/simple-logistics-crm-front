<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Client } from '../types'
import { validators } from '../../../services/utils'

const props = defineProps({
  client: {
    type: Object as PropType<Client | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewClient: Client = {
  id: -1,
  name: '',
  surname: '',
  patronymic: '',
  debt: 0,
  registrationAmount: 0,
  productDescription: '',
  status: 'NEW',
}

const newClient = ref<Client>({ ...defaultNewClient })

const form = useForm('add-client-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newClient.value)
  }
}

watch(
  () => props.client,
  () => {
    if (!props.client) {
      return
    }
    newClient.value = props.client
  },
  { immediate: true },
)

</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-client-form"
    class="flex-col justify-start items-start gap-6 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newClient.name"
          label="Название"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="name"
        />
        <VaInput
          v-model="newClient.info"
          label="Инфо"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="info"
        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">Отмена</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
