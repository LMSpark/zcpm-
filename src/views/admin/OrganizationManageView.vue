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
          <el-button type="primary" :icon="Plus" @click="edit()">新增</el-button>
          <el-button type="danger" :icon="Delete" @click="confirmDelete()">删除</el-button>
          <el-button type="primary" :icon="Download" @click="exportTemplate">导出模板</el-button>
          <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="importTemplate"><el-button type="primary" :icon="Upload">导入</el-button></el-upload>
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
              <el-button size="small" type="primary" @click="edit(row)">查看/编辑</el-button>
              <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </main>
    </div>
    <el-dialog v-model="visible" title="机构详情" width="720px">
      <el-form v-if="current" :model="current" label-width="110px">
        <el-form-item label="机构名称"><el-input v-model="current.name" /></el-form-item>
        <el-form-item label="代码"><el-input v-model="current.code" /></el-form-item>
        <el-form-item label="简称"><el-input v-model="current.shortName" /></el-form-item>
        <el-form-item label="法定代表人"><el-input v-model="current.legalPerson" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="current.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="current.address" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessageBox, type UploadFile } from "element-plus";
import { Delete, Download, Plus, Upload } from "@element-plus/icons-vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Organization } from "@/types";
import { downloadXlsx } from "@/utils/download";

const store = useAuctionStore();
const keyword = ref("");
const quick = ref("");
const current = ref<Organization | undefined>();
const rows = computed(() => store.db.organizations.filter((org) => !quick.value || org.name.includes(quick.value)));
const visible = computed({ get: () => Boolean(current.value), set: (val) => (!val ? (current.value = undefined) : undefined) });
const treeData = computed(() => [{ ...store.db.organizations[0], children: store.db.organizations.filter((org) => org.parentId === "org-root") }]);

function edit(row?: Organization) {
  current.value = row
    ? { ...row }
    : {
        id: "",
        parentId: "org-root",
        name: "新增机构",
        code: String(30 + store.db.organizations.length),
        shortName: "新增",
        establishedAt: new Date().toISOString().slice(0, 10),
        legalPerson: "负责人",
        phone: "13200000000",
        address: "武汉市"
      };
}

function save() {
  if (!current.value) return;
  store.saveOrganization(current.value);
  visible.value = false;
}

async function confirmDelete(id?: string) {
  const target = id || current.value?.id;
  if (!target) return;
  await ElMessageBox.confirm("确认删除机构？关联部门将同步移除。", "删除确认", { type: "error" });
  store.removeOrganization(target, "机构管理删除");
}

function exportTemplate() {
  downloadXlsx("机构导入模板.xlsx", {
    机构模板: [{ 机构名称: "示例机构", 代码: "ORG001", 简称: "示例", 法定代表人: "张三", 联系电话: "13200000000", 地址: "武汉市" }]
  });
}

function importTemplate(file: UploadFile) {
  store.saveOrganization({
    id: "",
    parentId: "org-root",
    name: file.name.replace(/\..+$/, "") || "导入机构",
    code: String(50 + store.db.organizations.length),
    shortName: "导入",
    establishedAt: new Date().toISOString().slice(0, 10),
    legalPerson: "导入负责人",
    phone: "13200000000",
    address: "模拟导入地址"
  });
}
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
