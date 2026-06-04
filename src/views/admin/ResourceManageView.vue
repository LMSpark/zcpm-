<template>
  <AdminLayout scope="platform">
    <div class="admin-card">
      <el-alert title="类别与类别下面的数据同屏维护，前台新闻/帮助等栏目读取同一份配置。" type="success" show-icon :closable="false" />
      <div class="dual-table">
        <section>
          <h3>类别</h3>
          <el-table :data="store.db.resourceCategories" border height="320" highlight-current-row @current-change="currentCategory = $event">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="sort" label="排序" />
            <el-table-column label="操作" width="130"><template #default="{ row }"><el-button size="small" @click="editCategory(row)">修改</el-button><el-button size="small" type="danger">删除</el-button></template></el-table-column>
          </el-table>
        </section>
        <section>
          <h3>类别下面的数据</h3>
          <el-table :data="items" border height="320">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="url" label="路径" />
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="sort" label="排序" />
            <el-table-column label="操作" width="130"><template #default="{ row }"><el-button size="small" @click="editItem(row)">修改</el-button><el-button size="small" type="danger">删除</el-button></template></el-table-column>
          </el-table>
        </section>
      </div>
    </div>
    <el-dialog v-model="visible" title="静态资源配置" width="620px">
      <el-form v-if="editTarget" label-width="100px">
        <el-form-item label="标题/名称"><el-input v-model="editTarget.title" /></el-form-item>
        <el-form-item label="路径"><el-input v-model="editTarget.url" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="editTarget.status"><el-option label="启用" value="启用" /><el-option label="停用" value="停用" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="saveItem">保存</el-button></template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { ResourceCategory, ResourceItem } from "@/types";

const store = useAuctionStore();
const currentCategory = ref<ResourceCategory | undefined>(store.db.resourceCategories[0]);
const visible = ref(false);
const editTarget = ref<ResourceItem | undefined>();
const items = computed(() => store.db.resourceItems.filter((item) => !currentCategory.value || item.categoryId === currentCategory.value.id));
function editCategory(row: ResourceCategory) {
  currentCategory.value = row;
}
function editItem(row: ResourceItem) {
  editTarget.value = { ...row };
  visible.value = true;
}
function saveItem() {
  if (editTarget.value) store.saveResourceItem(editTarget.value);
  visible.value = false;
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

.dual-table {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 18px;
}
</style>
