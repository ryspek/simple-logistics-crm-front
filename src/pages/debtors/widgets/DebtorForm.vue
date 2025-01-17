<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { useForm, VaSelect } from 'vuestic-ui'
import { Debtor } from '../types'
import { Client } from '../../clients/types'
import { validators } from '../../../services/utils'
import axiosInstance from '../../../services/config/axiosConfig'

const props = defineProps({
  debtor: {
    type: Object as PropType<Debtor | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewDebtor: Debtor = {
  id: -1,
  name: '',
  surname: '',
  patronymic: '',
  debt: 0,
  registrationAmount: 0,
  productDescription: '',
  note: '',
  status: 'NEW',
  client: null,
}

const newDebtor = ref<Debtor>({ ...defaultNewDebtor })
const clients = ref<Client[]>([])

const form = useForm('add-debtor-form')
const emit = defineEmits(['close', 'save'])

const fetchClients = async () => {
  try {
    const response = await axiosInstance.get('/client/all')
    clients.value = response.data.result
    console.log(clients.value) // Проверка данных
  } catch (error) {
    console.error('Ошибка при загрузке клиентов:', error)
  }
}

fetchClients()

const onSave = () => {
  if (form.validate()) {
    emit('save', newDebtor.value)
  }
}

watch(
  () => props.debtor,
  () => {
    if (props.debtor) {
      newDebtor.value = { ...props.debtor }
    } else {
      newDebtor.value = { ...defaultNewDebtor }
    }
  },
  { immediate: true },
)

</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-debtor-form"
    class="flex-col justify-start items-start gap-6 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newDebtor.surname"
          label="Фамилия"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="surname"
        />
        <VaInput
          v-model="newDebtor.name"
          label="Имя"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="name"
        />
        <VaInput
          v-model="newDebtor.patronymic"
          label="Отчество"
          class="w-full sm:w-1/2"
          name="patronymic"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newDebtor.productDescription"
          label="Описание товара"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="productDescription"
        />
        <VaInput
          v-model="newDebtor.debt"
          label="Сумма долга"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="debt"
          mask="numeral"
        />
        <VaInput
          v-model="newDebtor.registrationAmount"
          label="Зарег. сумма"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="registrationAmount"
          mask="numeral"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaSelect
          v-model="newDebtor.client"
          label="Клиент"
          class="w-full sm:w-1/2"
          :options="clients"
          :rules="[validators.required]"
          text-by="name"
          track-by="id"
          name="client"

        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">Отмена</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
