<script setup lang="ts">
import { ref } from 'vue'
import CargoForm from './widgets/CargoForm.vue'
import { Cargo } from './types'
import { useCargos } from './composables/useCargos'
import CargosTable from './widgets/CargosTable.vue'
import { useModal, useToast } from 'vuestic-ui'
import axiosInstance from "../../services/config/axiosConfig";

const doShowEditCargoModal = ref(false)
const doShowUploadFileModal = ref(false)
const selectedFile = ref<File>()

const { cargos, isLoading, filters, sorting, pagination, ...cargosApi } = useCargos()

const cargoToEdit = ref<Cargo | null>(null)

const showEditCargoModal = (cargo: Cargo) => {
  cargoToEdit.value = cargo
  doShowEditCargoModal.value = true
}

const showAddCargoModal = () => {
  cargoToEdit.value = null
  doShowEditCargoModal.value = true
}

const showUploadFileModal = () => {
  doShowUploadFileModal.value = true
}

const { init: notify } = useToast()

const onCargoDelete = async (cargo: Cargo) => {
  await cargosApi.remove(cargo)
  notify({
    message: `${cargo.id} удален`,
    color: 'success',
  })
}

const editFormRef = ref()

const { confirm } = useModal()

const onCargoSaved = async (cargo: Cargo) => {
  if (cargoToEdit.value) {
    await cargosApi.update(cargo)
    notify({
      message: `${cargo.name} обновлен`,
      color: 'success',
    })
  } else {
    await cargosApi.add(cargo)
    notify({
      message: `${cargo.name} создан`,
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
    const response = await axiosInstance.post('/cargo/upload', formData, {
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
  <h1 class="page-title">Грузы</h1>

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
          <VaButton @click="showAddCargoModal">Добавить</VaButton>
          <VaButton @click="showUploadFileModal">Загрузить</VaButton>
        </div>
      </div>

      <CargosTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :cargos="cargos"
        :loading="isLoading"
        :pagination="pagination"
        @editCargo="showEditCargoModal"
        @deleteCargo="onCargoDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditCargoModal"
    size="auto"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ cargoToEdit ? 'Редактирование груза' : 'Создание груза' }}</h1>
    <CargoForm
      ref="editFormRef"
      :cargo="cargoToEdit"
      :save-button-label="cargoToEdit ? 'Сохранить' : 'Добавить'"
      @close="cancel"
      @save="
        (cargo) => {
          onCargoSaved(cargo)
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
