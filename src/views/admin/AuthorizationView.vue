<template>
  <AdminLayout scope="platform">
    <div class="admin-card">
      <el-alert title="分级授权用于演示平台运营、商户、竞买人权限边界；路由和菜单已按角色区分。" type="success" show-icon :closable="false" />
      <el-table :data="roles" border>
        <el-table-column prop="role" label="角色" width="160" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column label="授权模块">
          <template #default="{ row }">
            <el-checkbox-group v-model="row.permissions">
              <el-checkbox v-for="permission in permissions" :key="permission" :label="permission" />
            </el-checkbox-group>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120"><template #default="{ row }"><el-button size="small" type="primary" @click="save(row)">保存</el-button></template></el-table-column>
      </el-table>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { PermissionKey, RolePermission } from "@/types";

const store = useAuctionStore();
const permissions: PermissionKey[] = ["交易管理", "挂牌交易", "系统管理", "商户入驻", "账号管理", "系统配置", "前台交易", "个人中心"];
const roles = ref<RolePermission[]>(store.db.rolePermissions.map((item) => ({ ...item, permissions: [...item.permissions] })));

function save(row: RolePermission) {
  store.saveRolePermission({ ...row, permissions: [...row.permissions] });
}
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
