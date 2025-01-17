<script lang="ts" setup>
import { Debtor } from '../types'
import { Pagination, Sorting } from '../../../data/pages/debtors'
import { PropType, ref, watch, computed } from 'vue'
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { useVModel } from '@vueuse/core'
import axiosInstance from "../../../services/config/axiosConfig";

const columns = defineVaDataTableColumns([
  { label: 'Фамилия', key: 'surname', sortable: true },
  { label: 'Сумма долга', key: 'debt', sortable: true },
  { label: 'Отстаток долга', key: 'balance', sortable: true },
  { label: 'Зарег. сумма', key: 'registrationAmount', sortable: true },
  { label: 'Описание товара', key: 'productDescription', sortable: true },
  { label: 'Статус', key: 'status', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
]);

const props = defineProps({
  debtors: {
    type: Array as PropType<Debtor[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, required: true },
});

const emit = defineEmits<{
  (event: 'edit-debtor', debtor: Debtor): void
  (event: 'delete-debtor', debtor: Debtor): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>();

const sortByVModel = useVModel(props, 'sortBy', emit);
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit);

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal();

const onDebtorEdit = async (debtor: Debtor) => {
  emit('edit-debtor', debtor);
};

const onDebtorDelete = async (debtor: Debtor) => {
  const agreed = await confirm({
    title: 'Удаление должника',
    message: `Подтвердите удаление должника ${debtor.surname}?`,
    okText: 'Удалить',
    cancelText: 'Отмена',
    size: 'small',
    maxWidth: '380px',
  });

  if (agreed) {
    emit('delete-debtor', debtor);
  }
};

// For the Note Modal
const showNoteModal = ref(false);
const currentNote = ref('');
const currentDebtorId = ref<number | null>(null);

const openNoteModal = (debtor: Debtor) => {
  currentDebtorId.value = debtor.id;
  currentNote.value = debtor.note || '';
  showNoteModal.value = true;
};

const saveNote = async (note: string) => {
  if (currentDebtorId.value !== null) {
    try {
      await axiosInstance.post('/debtor/note', {
        id: currentDebtorId.value,
        note: note,
      });
      const debtorIndex = props.debtors.findIndex(d => d.id === currentDebtorId.value);
      if (debtorIndex !== -1) {
        props.debtors[debtorIndex].note = note;
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }
};

// Watch for changes in currentNote to save live
watch(currentNote, (newNote) => {
  saveNote(newNote);
});

// For the Payment Modal
const showPaymentModal = ref(false);
const paymentSum = ref<number | null>(null);
const paymentDescription = ref('');
const currentPaymentDebtorId = ref<number | null>(null);

const openPaymentModal = (debtor: Debtor) => {
  currentPaymentDebtorId.value = debtor.id;
  paymentSum.value = null;
  paymentDescription.value = '';
  showPaymentModal.value = true;
};

const savePayment = async () => {
  if (currentPaymentDebtorId.value !== null) {
    try {
      await axiosInstance.post('/debt-payment', {
        id: currentPaymentDebtorId.value,
        sum: paymentSum.value,
        description: paymentDescription.value,
        status: 'NEW',
        debtor: { id: currentPaymentDebtorId.value },
      });
      showPaymentModal.value = false;
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  }
};

// For the Payment History Modal
const showPaymentHistoryModal = ref(false);
const paymentHistory = ref([]);

const openPaymentHistoryModal = async (debtor: Debtor) => {
  currentPaymentDebtorId.value = debtor.id;
  try {
    const response = await axiosInstance.get(`/debt-payment/${debtor.id}`);
    paymentHistory.value = Array.isArray(response.data.result) ? response.data.result : [];
    showPaymentHistoryModal.value = true;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    paymentHistory.value = [];
  }
};

const updatePaymentStatus = async (payment, newStatus) => {
  const agreed = await confirm({
    title: `${newStatus === 'CONFIRMED' ? 'Подтверждение платежа' : 'Отклонение платежа'}`,
    message: `Вы уверены, что хотите ${newStatus === 'CONFIRMED' ? 'подтвердить' : 'отклонить'} этот платеж?`,
    okText: 'Да',
    cancelText: 'Нет',
    size: 'small',
    maxWidth: '380px',
  });

  if (agreed) {
    try {
      const updatedPayment = { ...payment, status: newStatus };
      await axiosInstance.put('/debt-payment', updatedPayment);
      payment.status = newStatus;

      // Fetch the updated debtor data
      const response = await axiosInstance.get(`/debtor/${currentPaymentDebtorId.value}`);
      const updatedDebtor = response.data.result;

      // Find and update the debtor in the list
      const debtorIndex = props.debtors.findIndex(d => d.id === updatedDebtor.id);
      if (debtorIndex !== -1) {
        props.debtors[debtorIndex] = updatedDebtor;
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// For the Take Action Modal
const showConfirmTakeActionModal = ref(false);
const currentDebtor = ref<Debtor | null>(null);

const confirmTakeAction = (debtor: Debtor) => {
  currentDebtor.value = debtor;
  showConfirmTakeActionModal.value = true;
};

const takeAction = async () => {
  if (currentDebtor.value !== null) {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        await axiosInstance.post('/debtor/take-action', {
          id: currentDebtor.value.id,
          userId: JSON.parse(user).id,
        });
        const debtorIndex = props.debtors.findIndex(d => d.id === currentDebtor.value!.id);
        if (debtorIndex !== -1) {
          props.debtors[debtorIndex].status = 'ACTION_TAKEN';
        }
        showConfirmTakeActionModal.value = false;
      } catch (error) {
        console.error('Error taking action:', error);
      }
    }
  }
};

</script>


<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="debtors"
    :loading="$props.loading"
  >
    <template #cell(surname)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.surname + ' ' + rowData.name}}
      </div>
    </template>

<!--    <template #cell(name)="{ rowData }">-->
<!--      <div class="max-w-[120px] ellipsis">-->
<!--        {{ rowData.name }}-->
<!--      </div>-->
<!--    </template>-->

    <template #cell(debt)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.debt }}
      </div>
    </template>

    <template #cell(balance)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.balance }}
      </div>
    </template>

    <template #cell(registrationAmount)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.registrationAmount }}
      </div>
    </template>

    <template #cell(productDescription)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.productDescription }}
      </div>
    </template>

    <template #cell(status)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.statusDescription  }}
      </div>
    </template>

    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <VaButton
          v-if="rowData.status === 'NEW'"
          preset="primary"
          size="small"
          @click="confirmTakeAction(rowData as Debtor)"
        >
          Взять в работу
        </VaButton>
        <VaButton
          preset="primary"
          size="small"
          icon="mso-note"
          aria-label="Заметка"
          @click="openNoteModal(rowData as Debtor)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-payment"
          aria-label="Платеж"
          @click="openPaymentModal(rowData as Debtor)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-history"
          aria-label="История платежей"
          @click="openPaymentHistoryModal(rowData as Debtor)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="Редактировать"
          @click="onDebtorEdit(rowData as Debtor)"
        />
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Удалить"
          @click="onDebtorDelete(rowData as Debtor)"
        />
      </div>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{  $props.pagination.total  }} results.</b>
      <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="'flex">
      <VaBatton
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

  <VaModal
    v-model="showNoteModal"
    title="Заметка"
    hide-default-actions
  >
    <VaTextarea
      v-model="currentNote"
      placeholder="Введите заметку..."
      style="min-width: 100%"
    />
  </VaModal>

  <VaModal
    v-model="showPaymentModal"
    title="Платеж"
    hide-default-actions
  >
    <div>
      <VaInput
        v-model="paymentSum"
        placeholder="Сумма"
        type="number"
        min="0"
      />
      <VaTextarea
        v-model="paymentDescription"
        placeholder="Описание"
      />
      <div class="flex justify-end mt-4">
        <VaButton
          color="danger"
          @click="showPaymentModal = false"
        >
          Отмена
        </VaButton>
        <VaButton
          color="primary"
          @click="savePayment"
        >
          Сохранить
        </VaButton>
      </div>
    </div>
  </VaModal>

  <VaModal
    v-model="showPaymentHistoryModal"
    title="История платежей"
  >
    <div v-if="paymentHistory.length === 0">
      Нет записей.
    </div>
    <div v-else>
      <VaDataTable
        :columns="[
          { label: 'ID', key: 'id' },
          { label: 'Сумма', key: 'sum' },
          { label: 'Описание', key: 'description' },
          { label: 'Дата создания', key: 'createdAt' },
          { label: 'Дата обновления', key: 'updatedAt' },
          { label: 'Статус', key: 'status' },
          { label: 'Действия', key: 'actions' }
        ]"
        :items="paymentHistory"
      >
        <template #cell(createdAt)="{ rowData }">
          {{ formatDate(rowData.createdAt) }}
        </template>

        <template #cell(updatedAt)="{ rowData }">
          {{ formatDate(rowData.updatedAt) }}
        </template>

        <template #cell(actions)="{ rowData }">
          <div v-if="rowData.status === 'NEW'" class="flex gap-2">
            <VaButton color="danger" @click="updatePaymentStatus(rowData, 'DECLINED')">Отклонить</VaButton>
            <VaButton color="success" @click="updatePaymentStatus(rowData, 'CONFIRMED')">Подтвердить</VaButton>
          </div>
        </template>
      </VaDataTable>
    </div>
  </VaModal>

  <VaModal
    v-model="showConfirmTakeActionModal"
    title="Подтверждение"
    hide-default-actions
  >
    <div>
      Вы уверены, что хотите взять в работу эту запись?
      <div class="flex justify-end mt-4">
        <VaButton
          color="danger"
          @click="showConfirmTakeActionModal = false"
        >
          Отмена
        </VaButton>
        <VaButton
          color="primary"
          @click="takeAction"
        >
          Подтвердить
        </VaButton>
      </div>
    </div>
  </VaModal>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
