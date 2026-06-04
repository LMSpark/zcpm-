<template>
  <AdminLayout scope="platform">
    <div class="admin-card">
      <div class="table-actions">
        <el-button type="primary">新增</el-button>
        <el-button type="danger">删除</el-button>
        <el-input v-model="keyword" placeholder="请输入查找的值" class="quick" />
      </div>
      <el-table :data="rows" border height="560">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="name" label="部门名称" />
        <el-table-column prop="code" label="部门编码" />
        <el-table-column prop="manager" label="负责人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column label="所属机构">
          <template #default="{ row }">{{ store.db.organizations.find((org) => org.id === row.orgId)?.name }}</template>
        </el-table-column>
      </el-table>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
const store = useAuctionStore();
const keyword = ref("");
const rows = computed(() => store.db.departments.filter((dept) => !keyword.value || dept.name.includes(keyword.value)));
</script>

<style scoped>
.admin-card {
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}

.table-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.quick {
  width: 260px;
  margin-left: auto;
}
</style>
