<script setup lang="ts">
import { ref } from 'vue'
import ProductForm from './widgets/ProductFrom.vue'
import ProductsTable from './widgets/ProductsTable.vue'
import { Product } from './types'
import { useProducts } from './composables/useProducts'
import { useModal, useToast } from 'vuestic-ui'

const doShowEditProductModal = ref(false)

const { products, isLoading, filters, sorting, pagination, ...productsApi } = useProducts()

const productToEdit = ref<Product | null>(null)

const showEditProductModal = (product: Product) => {
  productToEdit.value = product
  doShowEditProductModal.value = true
}

const showAddProductModal = () => {
  productToEdit.value = null
  doShowEditProductModal.value = true
}
const { init: notify } = useToast()

const onProductDelete = async (product: Product) => {
  await productsApi.remove(product)
  notify({
    message: `${product.name} удален`,
    color: 'success',
  })
}

const editFormRef = ref()

const { confirm } = useModal()

const onProductSaved = async (product: Product) => {
  if (productToEdit.value) {
    await productsApi.update(product)
    notify({
      message: `${product.name} обновлен`,
      color: 'success',
    })
  } else {
    await productsApi.add(product)
    notify({
      message: `${product.name} создан`,
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
</script>

<template>
  <h1 class="page-title">Продукты</h1>

  <VaCard>
    <VaCardContent>
      <div class="flex flex-col md:flex-row gap-2 mb-2 justify-between">
        <div class="flex flex-col md:flex-row gap-2 justify-start">
          <!--          <VaButtonToggle-->
          <!--            v-model="filters.isActive"-->
          <!--            color="background-element"-->
          <!--            border-color="background-element"-->
          <!--            :options="[-->
          <!--              { label: 'Active', value: true },-->
          <!--              { label: 'Inactive', value: false },-->
          <!--            ]"-->
          <!--          />-->
          <VaInput v-model="filters.search" placeholder="Search">
            <template #prependInner>
              <VaIcon name="search" color="secondary" size="small" />
            </template>
          </VaInput>
        </div>
        <VaButton @click="showAddProductModal">Добавить</VaButton>
      </div>

      <ProductsTable
        v-model:sort-by="sorting.sortBy"
        v-model:sorting-order="sorting.sortingOrder"
        :products="products"
        :loading="isLoading"
        :pagination="pagination"
        @editProduct="showEditProductModal"
        @deleteProduct="onProductDelete"
      />
    </VaCardContent>
  </VaCard>

  <VaModal
    v-slot="{ cancel, ok }"
    v-model="doShowEditProductModal"
    size="auto"
    mobile-fullscreen
    close-button
    hide-default-actions
    :before-cancel="beforeEditFormModalClose"
  >
    <h1 class="va-h5">{{ productToEdit ? 'Редактирование продукта' : 'Создание продукта' }}</h1>
    <ProductForm
      ref="editFormRef"
      :product="productToEdit"
      :save-button-label="productToEdit ? 'Сохранить' : 'Добавить'"
      @close="cancel"
      @save="
        (product) => {
          onProductSaved(product)
          ok()
        }
      "
    />
  </VaModal>
</template>
