<script setup lang="ts">
import { ref } from 'vue'
import ClientForm from './widgets/ClientForm.vue'
import { Client } from './types'
import { useClients } from './composables/useClients'
import ClientsTable from './widgets/ClientsTable.vue'
import { useModal, useToast } from 'vuestic-ui'
import axiosInstance from "../../services/config/axiosConfig";


const doShowEditClientModal = ref(false)
const doShowUploadFileModal = ref(false)
const selectedFile = ref<File>()

const { clients, isLoading, filters, sorting, pagination, ...clientsApi } = useClients()

const clientToEdit = ref<Client | null>(null)

const showEditClientModal = (client: Client) => {
  clientToEdit.value = client
  doShowEditClientModal.value = true
}

const showAddClientModal = () => {
  clientToEdit.value = null
  doShowEditClientModal.value = true
}

const showUploadFileModal = () => {
  doShowUploadFileModal.value = true
}

const { init: notify } = useToast()

const onClientDelete = async (client: Client) => {
  await clientsApi.remove(client)
  notify({
    message: `${client.id} удален`,
    color: 'success',
  })
}

const editFormRef = ref()

const { confirm } = useModal()

const onClientSaved = async (client: Client) => {
  if (clientToEdit.value) {
    await clientsApi.update(client)
    notify({
      message: `${client.name} обновлен`,
      color: 'success',
    })
  } else {
    await clientsApi.add(client)
    notify({
      message: `${client.name} создан`,
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
    const response = await axiosInstance.post('/client/upload', formData, {
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
</script>

<template>
  <h1 class="page-title">Клиенты</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <div class="flex flex-col md:flex-row gap-2 justify-end">
          <VaButton @click="showAddClientModal">Добавить</VaButton>
          <VaButton @click="showUploadFileModal">Загрузить</VaButton>
        </div>
      </div>

      <ClientsTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :clients="clients"
        :loading="isLoading"
        :pagination="pagination"
        @editClient="showEditClientModal"
        @deleteClient="onClientDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditClientModal"
    size="auto"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ clientToEdit ? 'Редактирование клиента' : 'Создание клиента' }}</h1>
    <ClientForm
      ref="editFormRef"
      :client="clientToEdit"
      :save-button-label="clientToEdit ? 'Сохранить' : 'Добавить'"
      @close="cancel"
      @save="
        (client) => {
          onClientSaved(client)
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
