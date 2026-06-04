<template>
  <AdminLayout :scope="scope">
    <div class="admin-card">
      <el-table :data="store.db.assets" border height="560">
        <el-table-column prop="code" label="标的编号" />
        <el-table-column prop="name" label="标的名称" />
        <el-table-column prop="seller" label="所属企业" />
        <el-table-column prop="quantity" label="标的数量" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="附件" width="170"><template #default>数量证明材料.pdf</template></el-table-column>
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
        <el-form-item label="证明材料"><el-upload action="#" :auto-upload="false"><el-button type="primary">上传材料</el-button></el-upload></el-form-item>
      </el-form>
    </el-drawer>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Asset } from "@/types";

const route = useRoute();
const scope = computed(() => String(route.meta.scope || "platform") as "merchant" | "platform");
const store = useAuctionStore();
const current = ref<Asset | undefined>();
const visible = computed({ get: () => Boolean(current.value), set: (val) => (!val ? (current.value = undefined) : undefined) });
</script>

<style scoped>
.admin-card {
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}
</style>
