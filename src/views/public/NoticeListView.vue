<template>
  <PublicLayout>
    <section class="page-shell notice-page">
      <h1>{{ title }}</h1>
      <div class="notice-wrap surface">
        <aside class="category-side">
          <el-menu :default-active="type">
            <el-menu-item index="公告" @click="go('/announcements')">公告</el-menu-item>
            <el-menu-item index="交易公告" @click="go('/announcements')">交易公告</el-menu-item>
            <el-menu-item index="信息公示" @click="go('/results')">结果公示</el-menu-item>
            <el-menu-item index="新闻" @click="go('/news')">新闻中心</el-menu-item>
            <el-menu-item index="帮助" @click="go('/help')">帮助中心</el-menu-item>
          </el-menu>
        </aside>
        <main>
          <RouterLink v-for="notice in paged" :key="notice.id" :to="`/notices/${notice.id}`" class="notice-item">
            <div>
              <StatusTag :value="notice.publishStatus" />
              <h2>{{ notice.title }}</h2>
              <p>{{ notice.content }}</p>
            </div>
            <time>{{ formatDateTime(notice.publishedAt || notice.createdAt) }}</time>
          </RouterLink>
          <el-empty v-if="!paged.length" description="暂无数据" />
          <el-pagination v-model:current-page="page" :page-size="8" layout="prev, pager, next, jumper, total" :total="rows.length" />
        </main>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import PublicLayout from "@/layouts/PublicLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import { formatDateTime } from "@/utils/format";

const route = useRoute();
const router = useRouter();
const store = useAuctionStore();
const page = ref(1);
const type = computed(() => String(route.meta.type || "公告"));
const title = computed(() => String(route.meta.title || type.value));
const rows = computed(() => {
  if (type.value === "公告") return store.publicNotices.filter((notice) => ["公告", "交易公告", "挂牌公告"].includes(notice.type));
  return store.publicNotices.filter((notice) => notice.type === type.value || notice.type.includes(type.value));
});
const paged = computed(() => rows.value.slice((page.value - 1) * 8, page.value * 8));

watch(rows, () => (page.value = 1));
function go(path: string) {
  router.push(path);
}
</script>

<style scoped>
.notice-page {
  padding: 28px 0;
}

.notice-wrap {
  display: grid;
  grid-template-columns: 220px 1fr;
  overflow: hidden;
}

.category-side {
  background: var(--app-surface-muted);
  border-right: 1px solid var(--app-border);
}

.notice-wrap main {
  padding: 18px 24px;
}

.notice-item {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  padding: 18px 0;
  border-bottom: 1px solid var(--app-border);
}

.notice-item h2 {
  margin: 10px 0 8px;
  font-size: 18px;
}

.notice-item p {
  margin: 0;
  color: var(--app-text-soft);
}

time {
  color: var(--app-text-soft);
  white-space: nowrap;
}
</style>
