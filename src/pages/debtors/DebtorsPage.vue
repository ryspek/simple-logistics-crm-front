<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import DebtorForm from './widgets/DebtorForm.vue'
import { Debtor } from './types'
import { useDebtors } from './composables/useDebtors'
import DebtorsTable from './widgets/DebtorsTable.vue'
import { useModal, useToast, VaButton, VaFileUpload, VaModal, VaInput, VaIcon, VaSelect } from 'vuestic-ui'
import axiosInstance from "../../services/config/axiosConfig";
import { useRouter } from "vue-router";

const doShowEditDebtorModal = ref(false)
const doShowUploadFileModal = ref(false)
const selectedFile = ref<File>()

const { debtors, isLoading, filters, sorting, pagination, fetch, ...debtorsApi } = useDebtors()

const debtorToEdit = ref<Debtor | null>(null)

const showEditDebtorModal = (debtor: Debtor) => {
  debtorToEdit.value = debtor
  doShowEditDebtorModal.value = true
}

const showAddDebtorModal = () => {
  debtorToEdit.value = null
  doShowEditDebtorModal.value = true
}

const showUploadFileModal = () => {
  doShowUploadFileModal.value = true
}

const { init: notify } = useToast()

const onDebtorDelete = async (debtor: Debtor) => {
  await debtorsApi.remove(debtor)
  notify({
    message: `${debtor.id} удален`,
    color: 'success',
  })
}

const editFormRef = ref()

const { confirm } = useModal()

const onDebtorSaved = async (debtor: Debtor) => {
  if (debtorToEdit.value) {
    await debtorsApi.update(debtor)
    notify({
      message: `${debtor.surname} обновлен`,
      color: 'success',
    })
  } else {
    await debtorsApi.add(debtor)
    notify({
      message: `${debtor.surname} создан`,
      color: 'success',
    })
  }
}

const beforeEditFormModalClose = async (hide: () => unknown) => {
  if (editFormRef.value.isFormHasUnsavedChanges) {
    const agreed = await confirm({
      maxWidth: '380px',
      message: 'Форма имеет не сохраненные поля. Вы уверены, что хотите закрыть?',
      size: 'small',
    })
    if (agreed) {
      hide()
    }
  } else {
    hide()
  }
}

const uploadFile = async () => {
  if (!selectedFile.value) {
    notify({
      message: `Пожалуйста, выберите файл для загрузки`,
      color: 'warning',
    })
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await axiosInstance.post('/debtor/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    notify({
      message: `Файл успешно загружен`,
      color: 'success',
    })
    doShowUploadFileModal.value = false
    selectedFile.value = null
  } catch (error) {
    notify({
      message: `Ошибка при загрузке файла`,
      color: 'danger',
    })
  }
}

const router = useRouter()
const clients = ref([])

const clientOptions = ref([])

const statusOptions = ref([
  { label: 'Новый', value: 'NEW' },
  { label: 'В работе', value: 'IN_PROCESS' },
  { label: 'Долг закрыт', value: 'PAID_OFF' },
  { label: 'Удален', value: 'DELETED' }
])

onMounted(async () => {
  try {
    const response = await axiosInstance.get('/client/all');
    console.log('Client API response:', response.data);
    clientOptions.value = response.data.result.map((client: any) => ({
      label: client.name,
      value: client.id,
    }));
  } catch (error) {
    if (error.response && error.response.status === 401) {
      await router.push({ name: 'login' })
    }
    console.error('Error fetching clients:', error)
  }
})

const userHasRole = (role: string): boolean => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.roles?.includes(role)
}

watch(filters, () => {
  fetch()
}, { deep: true })
</script>

<template>
  <h1 class="page-title">Должники</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-wrap gap-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>

          <VaInput
            v-model="filters.dateFrom"
            type="date"
            placeholder="Дата с"
          />
          <VaInput
            v-model="filters.dateTo"
            type="date"
            placeholder="Дата по"
          />

          <VaSelect
            v-model="filters.selectedClients"
            :options="clientOptions"
            multiple
            text-by="label"
            value-by="value"
            placeholder="Выберите клиентов"
          />

          <VaSelect
            v-if="userHasRole('ADMIN') || userHasRole('MODERATOR')"
            v-model="filters.selectedStatuses"
            :options="statusOptions"
            multiple
            text-by="label"
            value-by="value"
            placeholder="Выберите статусы"
          />
        </div>
        <div class="flex flex-wrap gap-2 justify-start">
          <VaButton v-if="userHasRole('ADMIN')" @click="showAddDebtorModal">Добавить</VaButton>
          <VaButton v-if="userHasRole('ADMIN') || userHasRole('MODERATOR')" @click="showUploadFileModal">Загрузить</VaButton>
        </div>
      </div>

      <DebtorsTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :debtors="debtors"
        :loading="isLoading"
        :pagination="pagination"
        @editDebtor="showEditDebtorModal"
        @deleteDebtor="onDebtorDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditDebtorModal"
    size="auto"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ debtorToEdit ? 'Редактирование должника' : 'Создание должника' }}</h1>
    <DebtorForm
      ref="editFormRef"
      :debtor="debtorToEdit"
      :save-button-label="debtorToEdit ? 'Сохранить' : 'Добавить'"
      @close="cancel"
      @save="
        (debtor) => {
          onDebtorSaved(debtor)
          ok()
        }
      "
    />
  </VaModal>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowUploadFileModal"
    size="auto"
    mobile-fullscreen
    close-button
    hide-default-actions
  >
    <h1 class="va-h5">Загрузить файл</h1>
    <VaFileUpload v-model="selectedFile" type="single" />
    <VaButton @click="uploadFile">Подтвердить</VaButton>
  </VaModal>
</template>
