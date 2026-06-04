<template>
  <AdminLayout scope="platform">
    <div class="admin-card">
      <div class="table-actions">
        <el-button type="primary" @click="edit()">新增</el-button>
        <el-button type="danger" @click="confirmDelete()">删除</el-button>
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
        <el-table-column label="操作" width="160">
          <template #default="{ row }"><el-button size="small" type="primary" @click="edit(row)">编辑</el-button><el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button></template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="visible" title="部门维护" width="620px">
      <el-form v-if="current" :model="current" label-width="100px">
        <el-form-item label="部门名称"><el-input v-model="current.name" /></el-form-item>
        <el-form-item label="部门编码"><el-input v-model="current.code" /></el-form-item>
        <el-form-item label="所属机构"><el-select v-model="current.orgId"><el-option v-for="org in store.db.organizations" :key="org.id" :label="org.name" :value="org.id" /></el-select></el-form-item>
        <el-form-item label="负责人"><el-input v-model="current.manager" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="current.phone" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessageBox } from "element-plus";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Department } from "@/types";
const store = useAuctionStore();
const keyword = ref("");
const current = ref<Department | undefined>();
const visible = computed({ get: () => Boolean(current.value), set: (val) => (!val ? (current.value = undefined) : undefined) });
const rows = computed(() => store.db.departments.filter((dept) => !keyword.value || dept.name.includes(keyword.value)));

function edit(row?: Department) {
  current.value = row
    ? { ...row }
    : {
        id: "",
        orgId: store.db.organizations[0]?.id || "",
        name: "新增部门",
        code: `DEPT-${store.db.departments.length + 1}`,
        manager: "负责人",
        phone: "13200000000"
      };
}

function save() {
  if (!current.value) return;
  store.saveDepartment(current.value);
  visible.value = false;
}

async function confirmDelete(id?: string) {
  const target = id || current.value?.id;
  if (!target) return;
  await ElMessageBox.confirm("确认删除部门？", "删除确认", { type: "warning" });
  store.removeDepartment(target, "部门管理删除");
}
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
