<template>
  <AdminLayout :scope="scope">
    <div class="admin-card">
      <el-table :data="store.db.assets" border height="560">
        <el-table-column prop="code" label="标的编号" />
        <el-table-column prop="name" label="标的名称" />
        <el-table-column prop="seller" label="所属企业" />
        <el-table-column prop="quantity" label="标的数量" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="附件" width="190"><template #default="{ row }">{{ store.attachmentsFor('asset', row.id, '数量证明材料').length }} 个材料</template></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="current = row">查看</el-button>
            <el-button size="small" type="primary" @click="current = row">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer v-model="visible" title="标的数量证明材料" size="60%">
      <el-form v-if="current" label-width="150px">
        <el-form-item label="标的名称"><el-input :model-value="current.name" disabled /></el-form-item>
        <el-form-item label="数量"><el-input :model-value="current.quantity" disabled /></el-form-item>
        <el-form-item label="证明材料"><el-upload action="#" :auto-upload="false" :on-change="addFile"><el-button type="primary">上传材料</el-button></el-upload></el-form-item>
        <el-form-item label="附件清单">
          <div class="attachment-list">
            <el-tag v-for="item in attachments" :key="item.id" closable @close="removeAttachment(item.id)">{{ item.fileName }} · {{ item.uploadedAt }}</el-tag>
            <el-tag v-for="file in pendingFiles" :key="file.name" type="warning">{{ file.name }} · 待保存</el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">关闭</el-button><el-button type="primary" @click="saveAttachments">保存材料</el-button></template>
    </el-drawer>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox, type UploadFile } from "element-plus";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Asset } from "@/types";
import { mockUpload } from "@/utils/workflow";

const route = useRoute();
const scope = computed(() => String(route.meta.scope || "platform") as "merchant" | "platform");
const store = useAuctionStore();
const current = ref<Asset | undefined>();
const pendingFiles = ref<File[]>([]);
const visible = computed({ get: () => Boolean(current.value), set: (val) => (!val ? (current.value = undefined) : undefined) });
const attachments = computed(() => (current.value ? store.attachmentsFor("asset", current.value.id, "数量证明材料") : []));

function addFile(file: UploadFile) {
  if (file.raw) pendingFiles.value.push(file.raw);
}

async function saveAttachments() {
  if (!current.value) return;
  const attachments = mockUpload(pendingFiles.value, "asset", current.value.id, "数量证明材料", store.generateId);
  if (attachments.length) store.addAttachments(attachments);
  pendingFiles.value = [];
}

async function removeAttachment(id: string) {
  await ElMessageBox.confirm("确认删除该证明材料？", "删除确认", { type: "warning" });
  store.removeAttachment(id);
}
</script>

<style scoped>
.admin-card {
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
