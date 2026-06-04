<template>
  <PublicLayout>
    <section class="register-page page-shell">
      <h1>用户注册</h1>
      <el-card>
        <el-radio-group v-model="type">
          <el-radio-button value="个人注册">个人注册</el-radio-button>
          <el-radio-button value="商户注册">商户注册</el-radio-button>
        </el-radio-group>
        <el-steps :active="active" align-center class="steps">
          <el-step title="通过邮箱注册" />
          <el-step title="填写账号信息" />
          <el-step title="注册成功" />
        </el-steps>
        <el-form label-width="110px" class="form">
          <el-form-item label="电子邮箱"><el-input v-model="email" /></el-form-item>
          <el-form-item label="协议确认">
            <el-checkbox v-model="agree">我已阅读并同意平台服务协议、竞买须知、隐私政策</el-checkbox>
          </el-form-item>
          <el-form-item v-if="active >= 1" label="账号名称"><el-input v-model="username" /></el-form-item>
          <el-form-item v-if="active >= 1" label="手机号"><el-input v-model="phone" /></el-form-item>
          <el-form-item>
            <el-button type="primary" @click="next">{{ active < 2 ? "下一步" : "返回登录" }}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();
const type = ref("个人注册");
const active = ref(0);
const email = ref("250301476@qq.com");
const username = ref("newuser");
const phone = ref("17771476129");
const agree = ref(true);

function next() {
  if (active.value < 2) active.value += 1;
  else {
    auth.login(type.value === "商户注册" ? "merchant" : "bidder", username.value);
    router.push(type.value === "商户注册" ? "/merchant" : "/account");
  }
}
</script>

<style scoped>
.register-page {
  padding: 34px 0 80px;
}

.steps {
  margin: 34px 0;
}

.form {
  width: min(620px, 100%);
  margin: 0 auto;
}
</style>
