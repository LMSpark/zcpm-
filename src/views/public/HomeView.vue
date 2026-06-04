<template>
  <PublicLayout>
    <section class="hero">
      <div class="page-shell hero-grid">
        <div>
          <h1>聚焦城市矿产<br />开发再生资源</h1>
          <p>面向产权、资产处置、矿业权、工业循环物资的公开交易服务平台。</p>
          <div class="hero-actions">
            <RouterLink to="/bidding"><el-button type="primary" size="large">查看竞价标的</el-button></RouterLink>
            <RouterLink to="/hall"><el-button size="large">进入交易大厅</el-button></RouterLink>
          </div>
        </div>
        <div class="hero-panel">
          <div class="metric">
            <strong>{{ store.publishedAssets.length }}</strong>
            <span>公开标的</span>
          </div>
          <div class="metric">
            <strong>{{ activeCount }}</strong>
            <span>进行中</span>
          </div>
          <div class="metric">
            <strong>{{ resultCount }}</strong>
            <span>结果公示</span>
          </div>
        </div>
      </div>
    </section>

    <section class="page-shell section">
      <div class="section-title">
        <h2>竞价标的</h2>
        <RouterLink to="/bidding">更多</RouterLink>
      </div>
      <div class="asset-grid">
        <RouterLink v-for="asset in featuredBidding" :key="asset.id" class="asset-card" :to="`/assets/${asset.id}`">
          <AssetVisual :asset="asset" />
          <div class="asset-body">
            <h3>{{ asset.name }}</h3>
            <p>{{ asset.region }} · {{ asset.assetType }}</p>
            <div class="row">
              <span>当前价</span>
              <strong class="price">{{ formatMoney(asset.currentPrice) }}</strong>
            </div>
            <div class="row">
              <span>{{ asset.status }}</span>
              <span>{{ formatDateTime(asset.endAt) }} 结束</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="page-shell info-grid">
      <div class="surface info-panel">
        <div class="section-title">
          <h3>公告</h3>
          <RouterLink to="/announcements">更多</RouterLink>
        </div>
        <RouterLink v-for="notice in latestNotices" :key="notice.id" class="notice-line" :to="`/notices/${notice.id}`">
          <span>{{ notice.title }}</span>
          <em>{{ formatDateTime(notice.publishedAt || notice.createdAt) }}</em>
        </RouterLink>
      </div>
      <div class="surface info-panel">
        <div class="section-title">
          <h3>结果公示</h3>
          <RouterLink to="/results">更多</RouterLink>
        </div>
        <RouterLink v-for="notice in latestResults" :key="notice.id" class="notice-line" :to="`/notices/${notice.id}`">
          <span>{{ notice.title }}</span>
          <em>{{ formatDateTime(notice.publishedAt || notice.createdAt) }}</em>
        </RouterLink>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PublicLayout from "@/layouts/PublicLayout.vue";
import AssetVisual from "@/components/AssetVisual.vue";
import { useAuctionStore } from "@/stores/auction";
import { formatDateTime, formatMoney } from "@/utils/format";

const store = useAuctionStore();
const featuredBidding = computed(() => store.publishedAssets.filter((asset) => asset.method === "竞价").slice(0, 4));
const latestNotices = computed(() => store.publicNotices.filter((notice) => ["公告", "交易公告", "挂牌公告"].includes(notice.type)).slice(0, 6));
const latestResults = computed(() => store.publicNotices.filter((notice) => notice.type.includes("公示")).slice(0, 6));
const activeCount = computed(() => store.publishedAssets.filter((asset) => asset.status === "进行中").length);
const resultCount = computed(() => latestResults.value.length);
</script>

<style scoped>
.hero {
  background:
    linear-gradient(115deg, color-mix(in srgb, var(--app-primary), white 90%), #fff 58%),
    linear-gradient(135deg, var(--app-primary), transparent);
  border-bottom: 1px solid var(--app-border);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 40px;
  align-items: center;
  min-height: 380px;
  padding: 44px 0;
}

h1 {
  margin: 0;
  font-size: clamp(42px, 5vw, 72px);
  line-height: 1.05;
  letter-spacing: 0;
}

.hero p {
  width: min(580px, 100%);
  color: var(--app-text-soft);
  font-size: 18px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 14px;
}

.hero-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow);
}

.metric {
  padding: 22px 14px;
  text-align: center;
  background: var(--app-surface-muted);
  border-radius: 6px;
}

.metric strong {
  display: block;
  color: var(--app-primary);
  font-size: 36px;
}

.section {
  padding: 34px 0 10px;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.asset-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.asset-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--app-shadow);
}

.asset-body {
  padding: 16px;
}

.asset-body h3 {
  margin: 0 0 8px;
  font-size: 17px;
}

.asset-body p,
.row {
  color: var(--app-text-soft);
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  padding: 24px 0;
}

.info-panel {
  padding: 20px;
}

.notice-line {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid var(--app-border);
}

.notice-line em {
  color: var(--app-text-soft);
  font-style: normal;
  white-space: nowrap;
}

@media (max-width: 1000px) {
  .hero-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .asset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
