<template>
  <AdminLayout scope="platform">
    <div class="admin-card">
      <el-table :data="store.db.enterpriseApplications" border height="560">
        <el-table-column prop="enterpriseName" label="企业名称" />
        <el-table-column prop="applicant" label="申请人" />
        <el-table-column prop="assetType" label="主营类型" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="submittedAt" label="申请时间" />
        <el-table-column prop="status" label="状态"><template #default="{ row }"><StatusTag :value="row.status" /></template></el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" @click="current = row">查看</el-button>
            <el-button size="small" type="success" @click="store.auditEnterpriseApplication(row.id, true, '资料齐全')">通过</el-button>
            <el-button size="small" type="danger" @click="store.auditEnterpriseApplication(row.id, false, '请补充企业材料')">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="visible" title="入驻申请详情" width="720px">
      <el-descriptions v-if="current" border :column="2">
        <el-descriptions-item label="企业名称">{{ current.enterpriseName }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ current.applicant }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ current.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ current.email }}</el-descriptions-item>
        <el-descriptions-item label="主营类型">{{ current.assetType }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ current.address }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ current.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import type { EnterpriseApplication } from "@/types";

const store = useAuctionStore();
const current = ref<EnterpriseApplication | undefined>();
const visible = computed({ get: () => Boolean(current.value), set: (val) => (!val ? (current.value = undefined) : undefined) });
</script>

<style scoped>
.admin-card {
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}
</style>
