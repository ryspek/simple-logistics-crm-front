<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { useForm, VaInput } from 'vuestic-ui'
import { Product, TermType } from '../types'
import { validators } from '../../../services/utils'

const props = defineProps({
  product: {
    type: Object as PropType<Product | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewProduct: Product = {
  id: -1,
  name: '',
  isActive: false,
  minSum: null,
  maxSum: null,
  minInterestRate: null,
  maxInterestRate: null,
  minTerm: null,
  maxTerm: null,
  termType: 'day',
}

const termTypeSelectOptions: { text: Capitalize<TermType>; value: TermType }[] = [
  { text: 'День', value: 'DAY' },
  { text: 'Месяц', value: 'MONTH' },
]

const newProduct = ref<Product>({ ...defaultNewProduct })

const form = useForm('add-product-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newProduct.value)
  }
}

watch(
  () => props.product,
  () => {
    if (!props.product) {
      return
    }
    newProduct.value = props.product
  },
  { immediate: true },
)

</script>

<template>
  <VaForm
    v-slot="{ isValid }"
    ref="add-product-form"
    class="flex-col justify-start items-start gap-6 inline-flex w-full"
  >
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newProduct.name"
          label="Назнвание"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="name"
        />
        <div class="flex items-center w-1/2 mt-4">
          <VaCheckbox v-model="newProduct.isActive" label="Активный" class="w-full" name="active" />
        </div>
        <VaSelect
          v-model="newProduct.termType"
          label="Вид срока"
          class="w-full"
          :options="termTypeSelectOptions"
          :rules="[validators.required]"
          name="termType"
          value-by="value"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newProduct.minSum"
          label="Мин. сумма"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          mask="numeral"
        />
        <VaInput
          v-model="newProduct.maxSum"
          label="Макс. сумма"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="maxSum"
          mask="numeral"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newProduct.minInterestRate"
          label="Мин. процентная ставка"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="minInterestRate"
          mask="numeral"
        />
        <VaInput
          v-model="newProduct.maxInterestRate"
          label="Макс. процентная ставка"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="maxInterestRate"
          mask="numeral"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newProduct.minTerm"
          label="Мин. срок"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="minTerm"
          mask="numeral"
        />
        <VaInput
          v-model="newProduct.maxTerm"
          label="Макс. срок"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="maxTerm"
          mask="numeral"
        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">Отмена</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
