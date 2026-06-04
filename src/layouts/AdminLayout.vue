<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <AppLogo />
      </div>
      <el-input v-model="menuKeyword" placeholder="搜索..." class="menu-search">
        <template #suffix><Search :size="16" /></template>
      </el-input>
      <el-menu :default-active="$route.path" router background-color="transparent" text-color="#e9eef7" active-text-color="#fff">
        <template v-for="group in filteredMenu" :key="group.title">
          <el-sub-menu :index="group.title">
            <template #title>
              <component :is="group.icon" :size="18" />
              <span>{{ group.title }}</span>
            </template>
            <el-menu-item v-for="item in group.children" :key="item.path" :index="item.path">
              <span>{{ item.label }}</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </aside>
    <section class="admin-main">
      <header class="admin-topbar">
        <div class="top-left">
          <el-button text :icon="Fold" />
          <el-button text :icon="Refresh" @click="auctionStore.persist()" />
          <RouterLink to="/">
            <el-button text :icon="House">前台</el-button>
          </RouterLink>
        </div>
        <div class="top-right">
          <el-tag type="success" effect="plain">共享数据源</el-tag>
          <ThemeSwitcher />
          <el-dropdown @command="handleCommand">
            <span class="user-trigger">
              <el-avatar :size="32">{{ auth.currentUser?.name?.slice(0, 1) || "U" }}</el-avatar>
              {{ auth.currentUser?.name || "未登录" }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="merchant">切换商家账号</el-dropdown-item>
                <el-dropdown-item command="platform">切换平台账号</el-dropdown-item>
                <el-dropdown-item command="reset">重置演示数据</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <div class="tabs-bar">
        <RouterLink class="home-tab" to="/">⌂</RouterLink>
        <span class="work-tab active">{{ String($route.meta.title || "工作台") }}</span>
        <span class="work-tab">数据同步</span>
      </div>
      <main class="admin-content">
        <slot />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowDown, Fold, House, Refresh } from "@element-plus/icons-vue";
import { Building2, ClipboardList, Database, FileText, Gavel, Search, Settings, ShieldCheck, Users } from "lucide-vue-next";
import AppLogo from "@/components/AppLogo.vue";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import { useAuthStore } from "@/stores/auth";
import { useAuctionStore } from "@/stores/auction";
import type { PermissionKey } from "@/types";

const props = defineProps<{ scope: "merchant" | "platform" }>();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const auctionStore = useAuctionStore();
const menuKeyword = ref("");

const merchantMenu = [
  {
    title: "交易管理",
    icon: Gavel,
    children: [
      { label: "交易公告管理", path: "/merchant/announcements" },
      { label: "交易会管理", path: "/merchant/meetings" },
      { label: "标的管理", path: "/merchant/assets" },
      { label: "标的数量证明材料", path: "/merchant/materials" },
      { label: "信息公示管理", path: "/merchant/publicity" }
    ]
  },
  {
    title: "挂牌交易",
    icon: ClipboardList,
    children: [
      { label: "挂牌信息公示", path: "/merchant/listing-publicity" },
      { label: "挂牌公告", path: "/merchant/listing-announcements" },
      { label: "挂牌报名人审核", path: "/merchant/listing-bidders" },
      { label: "挂牌标的", path: "/merchant/listings" }
    ]
  },
  { title: "竞买人管理", icon: Users, children: [{ label: "竞买人管理", path: "/merchant/bidders" }] },
  { title: "账号管理", icon: Building2, children: [{ label: "企业信息维护", path: "/merchant/company" }] }
];

const platformMenu = [
  {
    title: "系统管理",
    icon: Settings,
    children: [
      { label: "在线用户", path: "/platform/online-users" },
      { label: "机构管理", path: "/platform/organizations" },
      { label: "部门管理", path: "/platform/departments" },
      { label: "分级授权", path: "/platform/authorization" },
      { label: "用户审核", path: "/platform/user-audit" },
      { label: "用户管理", path: "/platform/users" }
    ]
  },
  {
    title: "交易管理",
    icon: Gavel,
    children: [
      { label: "信息公示管理", path: "/platform/publicity" },
      { label: "交易公告管理", path: "/platform/announcements" },
      { label: "交易会管理", path: "/platform/meetings" },
      { label: "标的数量证明材料", path: "/platform/materials" },
      { label: "标的管理", path: "/platform/assets" }
    ]
  },
  {
    title: "挂牌交易",
    icon: ClipboardList,
    children: [
      { label: "挂牌信息公示", path: "/platform/listing-publicity" },
      { label: "挂牌公告", path: "/platform/listing-announcements" },
      { label: "挂牌报名人审核", path: "/platform/listing-bidders" },
      { label: "挂牌标的", path: "/platform/listings" }
    ]
  },
  { title: "商户入驻", icon: ShieldCheck, children: [{ label: "入驻申请", path: "/platform/entry" }] },
  { title: "账号管理", icon: Users, children: [{ label: "用户管理", path: "/platform/account-users" }] },
  {
    title: "系统配置",
    icon: Database,
    children: [
      { label: "新闻中心", path: "/platform/news" },
      { label: "静态资源配置", path: "/platform/resources" }
    ]
  },
  { title: "公开内容", icon: FileText, children: [{ label: "前台预览", path: "/" }] }
];

const menu = computed(() =>
  (props.scope === "merchant" ? merchantMenu : platformMenu).filter((group) => group.title === "公开内容" || auctionStore.hasPermission(auth.role, group.title as PermissionKey))
);
const filteredMenu = computed(() => {
  if (!menuKeyword.value) return menu.value;
  return menu.value
    .map((group) => ({
      ...group,
      children: group.children.filter((item) => item.label.includes(menuKeyword.value) || group.title.includes(menuKeyword.value))
    }))
    .filter((group) => group.children.length);
});

onMounted(() => {
  if (props.scope === "merchant" && auth.role !== "merchant") auth.login("merchant");
  if (props.scope === "platform" && auth.role !== "platform") auth.login("platform");
});

function handleCommand(command: string) {
  if (command === "merchant") {
    auth.login("merchant");
    router.push("/merchant");
  } else if (command === "platform") {
    auth.login("platform");
    router.push("/platform");
  } else if (command === "reset") {
    auctionStore.resetDemoData();
  } else if (command === "logout") {
    auth.logout();
    router.push(route.path.startsWith("/platform") ? "/platform/login" : "/merchant/login");
  }
}
</script>

<style scoped>
.admin-layout {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 260px 1fr;
  background: #eef2f6;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background: var(--app-sidebar);
  color: #fff;
}

.sidebar-brand {
  padding: 18px 20px 12px;
}

.sidebar :deep(.copy strong),
.sidebar :deep(.copy small) {
  color: #fff;
}

.menu-search {
  width: calc(100% - 28px);
  margin: 0 14px 14px;
}

.sidebar :deep(.el-menu) {
  border-right: 0;
}

.sidebar :deep(.el-sub-menu__title),
.sidebar :deep(.el-menu-item) {
  gap: 10px;
}

.sidebar :deep(.el-menu-item.is-active) {
  background: var(--app-primary) !important;
}

.admin-main {
  min-width: 0;
}

.admin-topbar,
.tabs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid var(--app-border);
}

.admin-topbar {
  min-height: 64px;
  padding: 0 22px;
}

.top-left,
.top-right,
.user-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-trigger {
  cursor: pointer;
}

.tabs-bar {
  justify-content: flex-start;
  min-height: 48px;
  overflow-x: auto;
}

.home-tab,
.work-tab {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 22px;
  border-right: 1px solid var(--app-border);
  color: var(--app-text-soft);
}

.work-tab.active {
  color: var(--app-text);
  border-top: 3px solid var(--app-primary);
  background: #fff;
}

.admin-content {
  padding: 16px;
}

@media (max-width: 980px) {
  .admin-layout {
    grid-template-columns: 84px 1fr;
  }

  .sidebar :deep(.copy),
  .sidebar :deep(.el-sub-menu__title span),
  .sidebar :deep(.el-menu-item span),
  .menu-search {
    display: none;
  }
}
</style>
