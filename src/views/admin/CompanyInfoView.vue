<template>
  <AdminLayout scope="merchant">
    <div class="admin-card">
      <el-table :data="[company]" border>
        <el-table-column prop="organization" label="企业名称" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="120"><template #default><el-button type="primary" @click="visible = true">修改</el-button></template></el-table-column>
      </el-table>
    </div>
    <el-drawer v-model="visible" title="企业信息维护" size="70%">
      <el-form :model="company" label-width="140px">
        <el-form-item label="企业名称"><el-input v-model="company.organization" /></el-form-item>
        <el-form-item label="企业编码"><el-input model-value="024" /></el-form-item>
        <el-form-item label="企业法人"><el-input v-model="company.name" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="company.phone" /></el-form-item>
        <el-form-item label="省份"><el-select model-value="北京市"><el-option label="北京市" value="北京市" /></el-select></el-form-item>
        <el-form-item label="城市"><el-select model-value="门辖区"><el-option label="门辖区" value="门辖区" /></el-select></el-form-item>
        <el-form-item label="详细地址"><el-input model-value="平台测试" /></el-form-item>
        <el-form-item label="企业简介"><el-input model-value="平台测试" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="企业logo"><el-upload action="#" :auto-upload="false"><el-button type="primary">上传文件</el-button></el-upload></el-form-item>
        <el-form-item label="营业执照"><el-upload action="#" :auto-upload="false"><el-button type="primary">上传文件</el-button></el-upload></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">关闭</el-button><el-button type="primary" @click="save">保存</el-button></template>
    </el-drawer>
  </AdminLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { useAuctionStore } from "@/stores/auction";

const auth = useAuthStore();
const store = useAuctionStore();
if (!auth.currentUser || auth.role !== "merchant") auth.login("merchant");
const visible = ref(false);
const company = reactive({ ...(auth.currentUser || store.db.users.find((u) => u.role === "merchant")!) });
function save() {
  store.saveUser(company);
  auth.updateCurrentUser(company);
  visible.value = false;
}
</script>

<style scoped>
.admin-card {
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}
</style>
