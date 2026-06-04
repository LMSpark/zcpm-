<template>
  <AdminLayout scope="platform">
    <div class="admin-card">
      <div class="table-actions">
        <el-button type="primary">新增</el-button>
        <el-input v-model="keyword" placeholder="请输入快速查找的值" class="quick" />
      </div>
      <el-table :data="rows" border height="560">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="username" label="登录账号" />
        <el-table-column prop="name" label="用户名称" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="verified" label="实名认证"><template #default="{ row }">{{ row.verified ? "已认证" : "未认证" }}</template></el-table-column>
        <el-table-column prop="status" label="状态"><template #default="{ row }"><StatusTag :value="row.status" /></template></el-table-column>
        <el-table-column prop="lastLogin" label="登录时间" />
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="edit(row)">查看</el-button>
            <el-button size="small" type="success" @click="approve(row)">审核通过</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="visible" title="用户信息" width="620px">
      <el-form v-if="current" :model="current" label-width="100px">
        <el-form-item label="账号"><el-input v-model="current.username" /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="current.name" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="current.phone" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="current.status"><el-option label="正常" value="正常" /><el-option label="待审核" value="待审核" /><el-option label="冻结" value="冻结" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import type { UserAccount } from "@/types";

const route = useRoute();
const store = useAuctionStore();
const keyword = ref("");
const current = ref<UserAccount | undefined>();
const visible = ref(false);
const mode = computed(() => String(route.meta.mode || ""));
const rows = computed(() =>
  store.db.users.filter((user) => {
    const byMode = mode.value === "audit" ? user.status === "待审核" || !user.verified : true;
    const byOnline = mode.value === "online" ? Boolean(user.lastLogin) : true;
    return byMode && byOnline && (!keyword.value || user.username.includes(keyword.value) || user.name.includes(keyword.value));
  })
);
function edit(row: UserAccount) {
  current.value = { ...row };
  visible.value = true;
}
function approve(row: UserAccount) {
  store.saveUser({ ...row, verified: true, status: "正常" });
}
function save() {
  if (current.value) store.saveUser(current.value);
  visible.value = false;
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
  width: 280px;
  margin-left: auto;
}
</style>
