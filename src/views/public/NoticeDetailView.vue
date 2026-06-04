<template>
  <PublicLayout>
    <section class="page-shell detail">
      <article v-if="notice" class="surface article">
        <StatusTag :value="notice.type" />
        <h1>{{ notice.title }}</h1>
        <p class="muted">编号 {{ notice.code }} · 发布时间 {{ formatDateTime(notice.publishedAt || notice.createdAt) }}</p>
        <el-divider />
        <p>{{ notice.content }}</p>
        <div v-if="asset" class="related">
          <h3>关联标的</h3>
          <RouterLink :to="`/assets/${asset.id}`">
            <el-button type="primary">{{ asset.name }} · 查看标的详情</el-button>
          </RouterLink>
        </div>
      </article>
      <el-empty v-else description="内容不存在" />
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import PublicLayout from "@/layouts/PublicLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import { formatDateTime } from "@/utils/format";

const route = useRoute();
const store = useAuctionStore();
const notice = computed(() => store.findNotice(String(route.params.id)));
const asset = computed(() => (notice.value?.relatedAssetId ? store.findAsset(notice.value.relatedAssetId) : undefined));
</script>

<style scoped>
.detail {
  padding: 28px 0;
}

.article {
  width: min(920px, 100%);
  min-height: 420px;
  margin: 0 auto;
  padding: 34px 46px;
}

.article h1 {
  margin: 18px 0 8px;
  text-align: center;
}

.article p {
  font-size: 16px;
  line-height: 1.9;
}

.related {
  margin-top: 30px;
  padding: 18px;
  background: var(--app-primary-weak);
  border-radius: 8px;
}
</style>
