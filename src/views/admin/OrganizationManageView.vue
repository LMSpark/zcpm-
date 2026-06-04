<template>
  <AdminLayout scope="platform">
    <div class="org-grid">
      <aside class="tree-panel">
        <h3>机构</h3>
        <el-input v-model="keyword" placeholder="请输入查找的值" />
        <el-tree :data="treeData" node-key="id" default-expand-all :props="{ label: 'name' }" />
      </aside>
      <main class="admin-card">
        <div class="table-actions">
          <el-button type="primary" :icon="Plus">新增</el-button>
          <el-button type="danger" :icon="Delete">删除</el-button>
          <el-button type="primary" :icon="Download">导出模板</el-button>
          <el-button type="primary" :icon="Upload">导入</el-button>
          <el-input v-model="quick" placeholder="请输入查找的值" class="quick" />
        </div>
        <el-table :data="rows" border height="560">
          <el-table-column type="selection" width="48" />
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="name" label="机构名称" />
          <el-table-column prop="code" label="代码" />
          <el-table-column prop="shortName" label="简称" />
          <el-table-column prop="establishedAt" label="成立日期" />
          <el-table-column prop="legalPerson" label="法定代表人" />
          <el-table-column prop="phone" label="机构联系电话" />
          <el-table-column prop="address" label="机构地址" />
          <el-table-column label="操作" width="190">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="current = row">查看</el-button>
              <el-button size="small" type="primary" @click="current = row">编辑</el-button>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </main>
    </div>
    <el-dialog v-model="visible" title="机构详情" width="720px">
      <el-descriptions v-if="current" border :column="2">
        <el-descriptions-item label="机构名称">{{ current.name }}</el-descriptions-item>
        <el-descriptions-item label="代码">{{ current.code }}</el-descriptions-item>
        <el-descriptions-item label="简称">{{ current.shortName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ current.phone }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ current.address }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Delete, Download, Plus, Upload } from "@element-plus/icons-vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Organization } from "@/types";

const store = useAuctionStore();
const keyword = ref("");
const quick = ref("");
const current = ref<Organization | undefined>();
const rows = computed(() => store.db.organizations.filter((org) => !quick.value || org.name.includes(quick.value)));
const visible = computed({ get: () => Boolean(current.value), set: (val) => (!val ? (current.value = undefined) : undefined) });
const treeData = computed(() => [{ ...store.db.organizations[0], children: store.db.organizations.filter((org) => org.parentId === "org-root") }]);
</script>

<style scoped>
.org-grid {
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 14px;
}

.tree-panel,
.admin-card {
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}

.tree-panel {
  min-height: 640px;
}

.table-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.quick {
  margin-left: auto;
  width: 260px;
}
</style>
