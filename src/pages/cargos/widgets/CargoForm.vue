<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { Cargo } from '../types'
import { validators } from '../../../services/utils'

const props = defineProps({
  cargo: {
    type: Object as PropType<Cargo | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewCargo: Cargo = {
  id: -1,
  name: '',
  surname: '',
  patronymic: '',
  debt: 0,
  registrationAmount: 0,
  productDescription: '',
  status: 'NEW',
}

const newCargo = ref<Cargo>({ ...defaultNewCargo })

const form = useForm('add-cargo-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newCargo.value)
  }
}

watch(
  () => props.cargo,
  () => {
    if (!props.cargo) {
      return
    }
    newCargo.value = props.cargo
  },
  { immediate: true },
)

</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-cargo-form"
    class="flex-col justify-start items-start gap-6 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newCargo.name"
          label="Название"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="name"
        />
        <VaInput
          v-model="newCargo.info"
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
