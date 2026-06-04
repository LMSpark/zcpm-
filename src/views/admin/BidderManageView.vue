<template>
  <AdminLayout :scope="scope">
    <div class="admin-card">
      <el-alert title="竞买人报名、审核、保证金状态与前台我的交易/标的详情同步" type="success" show-icon :closable="false" />
      <el-table :data="meetings" border height="260" highlight-current-row @current-change="selectedMeeting = $event">
        <el-table-column prop="code" label="交易会编号" />
        <el-table-column prop="name" label="交易会名称" />
        <el-table-column prop="type" label="交易会类型" />
        <el-table-column prop="status" label="交易会状态" />
        <el-table-column prop="startAt" label="开始时间" />
        <el-table-column label="操作" width="110"><template #default="{ row }"><el-button size="small" @click="selectedMeeting = row">查看</el-button></template></el-table-column>
      </el-table>
      <h3>{{ method === "挂牌" ? "挂牌报名人审核" : "网络竞买人管理" }}</h3>
      <el-table :data="registrations" border>
        <el-table-column type="selection" width="48" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="bidNo" label="竞买号" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="idNo" label="证件号" />
        <el-table-column prop="registeredAt" label="报名时间" />
        <el-table-column prop="applyStatus" label="审核"><template #default="{ row }"><StatusTag :value="row.applyStatus" /></template></el-table-column>
        <el-table-column prop="depositStatus" label="保证金"><template #default="{ row }"><StatusTag :value="row.depositStatus" /></template></el-table-column>
        <el-table-column label="操作" width="230">
          <template #default="{ row }">
            <el-button size="small" @click="viewRow = row">查看</el-button>
            <el-button size="small" type="success" @click="store.auditRegistration(row.id, true, '审核通过')">通过</el-button>
            <el-button size="small" type="danger" @click="store.auditRegistration(row.id, false, '资料不完整')">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="detailVisible" title="竞买人详情" width="640px">
      <el-descriptions v-if="viewRow" border :column="1">
        <el-descriptions-item label="姓名">{{ viewRow.name }}</el-descriptions-item>
        <el-descriptions-item label="竞买号">{{ viewRow.bidNo }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ viewRow.phone }}</el-descriptions-item>
        <el-descriptions-item label="证件号">{{ viewRow.idNo }}</el-descriptions-item>
        <el-descriptions-item label="保证金">{{ viewRow.depositStatus }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Meeting, Registration } from "@/types";

const route = useRoute();
const store = useAuctionStore();
const scope = computed(() => String(route.meta.scope || "merchant") as "merchant" | "platform");
const method = computed(() => String(route.meta.method || "竞价"));
const meetings = computed(() => store.db.meetings.filter((meeting) => meeting.assetIds.some((id) => store.findAsset(id)?.method === method.value)));
const selectedMeeting = ref<Meeting | undefined>(meetings.value[0]);
const viewRow = ref<Registration | undefined>();
const detailVisible = computed({ get: () => Boolean(viewRow.value), set: (val) => (!val ? (viewRow.value = undefined) : undefined) });
const registrations = computed(() => {
  const assetIds = selectedMeeting.value?.assetIds || store.db.assets.filter((asset) => asset.method === method.value).map((asset) => asset.id);
  return store.db.registrations.filter((reg) => assetIds.includes(reg.assetId));
});

watch(meetings, () => {
  if (!selectedMeeting.value) selectedMeeting.value = meetings.value[0];
});
</script>

<style scoped>
.admin-card {
  display: grid;
  gap: 16px;
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}
</style>
