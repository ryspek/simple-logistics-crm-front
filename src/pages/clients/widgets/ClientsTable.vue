<script setup lang="ts">
import { Pagination, Sorting } from '../../../data/pages/clients'
import {computed, PropType, toRef} from 'vue'
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useVModel } from '@vueuse/core'
import { Client } from "../types";

const columns = defineVaDataTableColumns([
  { label: 'Код', key: 'id', sortable: true },
  { label: 'Название', key: 'name', sortable: true },
  { label: 'Инфо', key: 'info', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

const props = defineProps({
  clients: {
    type: Array as PropType<Client[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
})

const emit = defineEmits<{
  (event: 'edit-client', client: Client): void
  (event: 'delete-client', client: Client): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()

const onClientEdit = async (client: Client) => {
  emit('edit-client', client)
}

const onClientDelete = async (client: Client) => {
  const agreed = await confirm({
    title: 'Удаление клиента',
    message: `Подтвердите удаление клиента ${client.name}?`,
    okText: 'Удалить',
    cancelText: 'Отмена',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    emit('delete-client', client)
  }
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="clients"
    :loading="$props.loading"
  >
    <template #cell(id)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.id }}
      </div>
    </template>

    <template #cell(name)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.name }}
      </div>
    </template>

    <template #cell(info)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.info }}
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="Редактировать"
          @click="onClientEdit(rowData as Client)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Удалить"
          @click="onClientDelete(rowData as Client)"
        />
      </div>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ $props.pagination.total }} results.</b>
      Results per page
      <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Previous page"
        :disabled="$props.pagination.page === 1"
        @click="$props.pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Next page"
        :disabled="$props.pagination.page === totalPages"
        @click="$props.pagination.page++"
      />
      <VaPagination
        v-model="$props.pagination.page"
        buttons-preset="secondary"
        :pages="totalPages"
        :visible-pages="5"
        :boundary-links="false"
        :direction-links="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
