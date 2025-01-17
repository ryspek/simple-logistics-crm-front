<script setup lang="ts">
import { Product } from '../types'
import { Pagination, Sorting } from '../../../data/pages/products'
import { PropType } from 'vue'
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useVModel } from '@vueuse/core'

const columns = defineVaDataTableColumns([
  { label: 'Название', key: 'name', sortable: true },
  { label: 'Имя', key: 'name', sortable: true },
  { label: 'Дата рождения', key: 'birthDate', sortable: true },
  { label: 'ИНН', key: 'inn', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

const props = defineProps({
  products: {
    type: Array as PropType<Product[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-product', product: Product): void
  (event: 'delete-product', product: Product): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()


const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)


const { confirm } = useModal()

const onProductEdit = async (product: Product) => {
  emit('edit-product', product)
}

const onProductDelete = async (product: Product) => {
  const agreed = await confirm({
    title: 'Удаление клиента',
    message: `Подтвердите удаление клиента ${product.name}?`,
    okText: 'Удалить',
    cancelText: 'Отмена',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-product', product)
  }
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="products"
    :loading="$props.loading"
  >
    <template #cell(name)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.name }}
      </div>
    </template>

    <template #cell(isActive)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.isActive }}
      </div>
    </template>

    <template #cell(minSum)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.minSum }}
      </div>
    </template>

    <template #cell(maxSum)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.maxSum }}
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="Редактировать"
          @click="onProductEdit(rowData as Product)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Удалить"
          @click="onProductDelete(rowData as Product)"
        />
      </div>
    </template>
  </VaDataTable>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
