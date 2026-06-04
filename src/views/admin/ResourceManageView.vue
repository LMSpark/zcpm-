<template>
  <AdminLayout scope="platform">
    <div class="admin-card">
      <el-alert title="类别与类别下面的数据同屏维护，前台新闻/帮助等栏目读取同一份配置。" type="success" show-icon :closable="false" />
      <div class="dual-table">
        <section>
          <h3>类别 <el-button size="small" type="primary" @click="editCategory()">新增类别</el-button></h3>
          <el-table :data="store.db.resourceCategories" border height="320" highlight-current-row @current-change="currentCategory = $event">
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="sort" label="排序" />
            <el-table-column label="操作" width="150"><template #default="{ row }"><el-button size="small" @click="editCategory(row)">修改</el-button><el-button size="small" type="danger" @click="deleteCategory(row.id)">删除</el-button></template></el-table-column>
          </el-table>
        </section>
        <section>
          <h3>类别下面的数据 <el-button size="small" type="primary" @click="editItem()">新增数据</el-button></h3>
          <el-table :data="items" border height="320">
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="url" label="路径" />
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="sort" label="排序" />
            <el-table-column label="操作" width="150"><template #default="{ row }"><el-button size="small" @click="editItem(row)">修改</el-button><el-button size="small" type="danger" @click="deleteItem(row.id)">删除</el-button></template></el-table-column>
          </el-table>
        </section>
      </div>
    </div>
    <el-dialog v-model="visible" title="静态资源配置" width="620px">
      <el-form v-if="editTarget" label-width="100px">
        <el-form-item label="标题/名称"><el-input v-model="editTarget.title" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="editTarget.resourceType"><el-option label="新闻" value="新闻" /><el-option label="帮助" value="帮助" /><el-option label="合作企业" value="合作企业" /><el-option label="静态资源" value="静态资源" /></el-select></el-form-item>
        <el-form-item label="路径"><el-input v-model="editTarget.url" /></el-form-item>
        <el-form-item label="摘要"><el-input v-model="editTarget.summary" type="textarea" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="editTarget.sort" :min="1" /></el-form-item>
        <el-form-item label="置顶"><el-switch v-model="editTarget.pinned" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="editTarget.status"><el-option label="启用" value="启用" /><el-option label="停用" value="停用" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="saveItem">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="categoryVisible" title="类别维护" width="520px">
      <el-form v-if="categoryTarget" label-width="90px">
        <el-form-item label="名称"><el-input v-model="categoryTarget.name" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="categoryTarget.type"><el-option label="类别" value="类别" /><el-option label="广告位" value="广告位" /><el-option label="帮助分类" value="帮助分类" /><el-option label="新闻分类" value="新闻分类" /><el-option label="合作企业" value="合作企业" /></el-select></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="categoryTarget.sort" :min="1" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="categoryTarget.enabled" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="categoryVisible = false">取消</el-button><el-button type="primary" @click="saveCategory">保存</el-button></template>
    </el-dialog>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessageBox } from "element-plus";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { ResourceCategory, ResourceItem } from "@/types";

const store = useAuctionStore();
const currentCategory = ref<ResourceCategory | undefined>(store.db.resourceCategories[0]);
const visible = ref(false);
const categoryVisible = ref(false);
const editTarget = ref<ResourceItem | undefined>();
const categoryTarget = ref<ResourceCategory | undefined>();
const items = computed(() => store.db.resourceItems.filter((item) => !currentCategory.value || item.categoryId === currentCategory.value.id));
function editCategory(row?: ResourceCategory) {
  categoryTarget.value = row ? { ...row } : { id: "", name: "新增类别", type: "类别", sort: store.db.resourceCategories.length + 1, enabled: true };
  categoryVisible.value = true;
}
function editItem(row?: ResourceItem) {
  editTarget.value = row
    ? { ...row }
    : { id: "", categoryId: currentCategory.value?.id || store.db.resourceCategories[0]?.id || "", title: "新增数据", url: "/", status: "启用", sort: items.value.length + 1, resourceType: "静态资源", summary: "" };
  visible.value = true;
}
function saveCategory() {
  if (categoryTarget.value) store.saveResourceCategory(categoryTarget.value);
  categoryVisible.value = false;
}
function saveItem() {
  if (editTarget.value) store.saveResourceItem(editTarget.value);
  visible.value = false;
}
async function deleteCategory(id: string) {
  await ElMessageBox.confirm("确认删除类别及下面的数据？", "删除确认", { type: "warning" });
  store.removeResourceCategory(id, "静态资源配置删除类别");
}
async function deleteItem(id: string) {
  await ElMessageBox.confirm("确认删除该数据？", "删除确认", { type: "warning" });
  store.removeResourceItem(id, "静态资源配置删除数据");
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
