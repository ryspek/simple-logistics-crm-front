<script setup lang="ts">
import { PropType, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { User, UserRole } from '../types'
import { validators } from '../../../services/utils'

const props = defineProps({
  user: {
    type: Object as PropType<User | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewUser: User = {
  id: -1,
  avatar: '',
  fullname: '',
  surname: '',
  name: '',
  patronymic: '',
  role: 'ROLE_USER',
  username: '',
  notes: '',
  email: '',
  active: true,
  password: '',
}

const newUser = ref<User>({ ...defaultNewUser })

watch(
  () => props.user,
  () => {
    if (!props.user) {
      return
    }
    newUser.value = props.user
  },
  { immediate: true },
)

const form = useForm('add-user-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newUser.value)
  }
}

const roleSelectOptions: { text: Capitalize<UserRole>; value: UserRole }[] = [
  { text: 'Админ', value: 'ROLE_ADMIN' },
  { text: 'Сотрудник', value: 'ROLE_USER' },
  { text: 'Модератор', value: 'ROLE_MODERATOR' },
]

</script>

<template>
  <VaForm v-slot="{ isValid }" ref="add-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newUser.fullname"
          label="ФИО"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="fullname"
        />
        <VaInput
          v-model="newUser.username"
          label="Логин"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          name="username"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newUser.email"
          label="Email"
          class="w-full sm:w-1/2"
          :rules="[validators.required, validators.email]"
          name="email"
        />
      </div>

      <div class="flex gap-4 w-full">
        <div class="w-1/2">
          <VaSelect
            v-model="newUser.role"
            label="Роль"
            class="w-full"
            :options="roleSelectOptions"
            :rules="[validators.required]"
            text-by="value"
            track-by="role"
            value-by="value"
            name="role"
          />
          <VaInput
            v-model="newUser.password"
            label="Пароль"
            class="w-full sm:w-1/2"
            :rules="[validators.required]"
            name="password"
          />
        </div>

        <div class="flex items-center w-1/2 mt-4">
          <VaCheckbox v-model="newUser.active" label="Active" class="w-full" name="active" />
        </div>
      </div>

      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">Cancel</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
