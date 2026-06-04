<template>
  <PublicLayout>
    <section class="login-hero">
      <div class="login-copy">
        <h1>聚焦城市矿产<br />开发再生资源</h1>
        <p>力争打造面向全国的一流城市矿产交易平台</p>
      </div>
      <div class="login-card">
        <h2>{{ title }}</h2>
        <el-input v-model="username" placeholder="用户名" />
        <el-input v-model="password" type="password" placeholder="密码" show-password />
        <el-button type="primary" size="large" @click="login">登录</el-button>
        <div class="login-links">
          <RouterLink to="/register">立即注册</RouterLink>
          <RouterLink to="/help">忘记密码?</RouterLink>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { useAuthStore } from "@/stores/auth";
import type { Role } from "@/types";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const username = ref("suqcir");
const password = ref("123456");
const role = computed<Role>(() => (route.meta.role as Role) || "bidder");
const title = computed(() => (role.value === "merchant" ? "商家登录" : role.value === "platform" ? "平台登录" : "竞买人登录"));

function login() {
  auth.login(role.value, username.value);
  if (role.value === "merchant") router.push("/merchant");
  else if (role.value === "platform") router.push("/platform");
  else router.push("/account");
}
</script>

<style scoped>
.login-hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: center;
  min-height: 560px;
  padding: 70px max(40px, calc((100vw - 1200px) / 2));
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 45%),
    linear-gradient(120deg, #12bfa3, #14c1b4);
}

.login-copy {
  color: #fff;
  text-align: center;
}

.login-copy h1 {
  font-size: 64px;
  line-height: 1.15;
}

.login-card {
  display: grid;
  gap: 20px;
  padding: 42px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  box-shadow: var(--app-shadow);
}

.login-card h2 {
  color: var(--app-primary);
}

.login-links {
  display: flex;
  justify-content: space-between;
}

.login-links a {
  color: var(--app-primary);
}
</style>
