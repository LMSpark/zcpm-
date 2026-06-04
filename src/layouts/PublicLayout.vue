<template>
  <div class="public-layout">
    <div class="top-strip">
      <div class="page-shell strip-inner">
        <span>温馨提示：平台目前处于试运营阶段，演示数据多端共享。</span>
        <div class="quick-links">
          <RouterLink to="/merchant/login">交易企业(商家)登录</RouterLink>
          <RouterLink to="/register">免费注册</RouterLink>
          <RouterLink to="/login">竞买方登录</RouterLink>
          <ThemeSwitcher />
        </div>
      </div>
    </div>
    <header class="public-header">
      <div class="page-shell nav-row">
        <RouterLink to="/" class="brand">
          <AppLogo />
        </RouterLink>
        <nav>
          <RouterLink v-for="item in nav" :key="item.path" :to="item.path">{{ item.label }}</RouterLink>
        </nav>
        <el-input v-model="keyword" clearable placeholder="搜索标的" class="search" @keyup.enter="goSearch">
          <template #append>
            <el-button :icon="Search" @click="goSearch" />
          </template>
        </el-input>
      </div>
    </header>
    <main>
      <slot />
    </main>
    <footer class="public-footer">
      <div class="page-shell footer-grid">
        <div>
          <h3>竞买人帮助</h3>
          <p>竞拍流程</p>
          <p>出价规则</p>
          <p>延时规则</p>
        </div>
        <div>
          <h3>支付帮助</h3>
          <p>如何报名交保证金</p>
          <p>交保遇到限额</p>
          <p>尾款如何支付</p>
        </div>
        <div>
          <h3>常见问题</h3>
          <p>退还保证金</p>
          <p>悔拍怎么办</p>
          <p>如何办理过户</p>
        </div>
        <div>
          <h3>关于我们</h3>
          <p>邮编：999999</p>
          <p>客服热线：400-999-9999</p>
          <p>联系地址：武汉市东湖高新区</p>
        </div>
      </div>
      <div class="copyright">许可证 | 版权所有</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import AppLogo from "@/components/AppLogo.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";

const router = useRouter();
const keyword = ref("");

const nav = [
  { label: "首页", path: "/" },
  { label: "竞价标的", path: "/bidding" },
  { label: "挂牌标的", path: "/listings" },
  { label: "交易大厅", path: "/hall" },
  { label: "公告", path: "/announcements" },
  { label: "结果公示", path: "/results" },
  { label: "我的交易", path: "/account" }
];

function goSearch() {
  router.push({ path: "/bidding", query: { keyword: keyword.value } });
}
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  background: var(--app-bg);
}

.top-strip {
  border-top: 3px solid var(--app-primary);
  background: #fff;
  font-size: 13px;
}

.strip-inner,
.quick-links,
.nav-row,
nav {
  display: flex;
  align-items: center;
}

.strip-inner {
  justify-content: space-between;
  min-height: 42px;
  gap: 16px;
}

.quick-links {
  gap: 18px;
}

.quick-links a {
  white-space: nowrap;
}

.quick-links a:hover,
nav a.router-link-active,
nav a:hover {
  color: var(--app-primary);
}

.public-header {
  position: sticky;
  z-index: 20;
  top: 0;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid var(--app-border);
  backdrop-filter: blur(12px);
}

.nav-row {
  min-height: 74px;
  gap: 28px;
}

.brand {
  flex: 0 0 auto;
}

nav {
  flex: 1;
  justify-content: center;
  gap: 28px;
  font-size: 16px;
}

.search {
  width: 250px;
}

.public-footer {
  margin-top: 48px;
  background: #fff;
  border-top: 1px solid var(--app-border);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  padding: 34px 0;
}

.footer-grid h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.footer-grid p {
  margin: 7px 0;
  color: var(--app-text-soft);
}

.copyright {
  padding: 18px 0;
  text-align: center;
  color: #a5aab3;
  background: #2c2c2c;
}

@media (max-width: 1100px) {
  .nav-row {
    flex-wrap: wrap;
    padding: 12px 0;
  }

  nav {
    order: 3;
    flex-basis: 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }
}

@media (max-width: 720px) {
  .strip-inner {
    align-items: flex-start;
    flex-direction: column;
    padding: 8px 0;
  }

  .quick-links {
    flex-wrap: wrap;
    gap: 8px 12px;
  }
}
</style>
