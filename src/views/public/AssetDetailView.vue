<template>
  <PublicLayout>
    <section v-if="asset" class="page-shell detail-page">
      <div class="meeting-strip surface">
        <div>
          <h2>{{ meeting?.name || "标的详情" }}</h2>
          <p>{{ asset.seller }} · 联系电话 13247164111 · 竞买号：{{ registration?.bidNo || "报名后生成" }}</p>
        </div>
        <el-input v-model="quickKeyword" placeholder="请输入本场交易会的标的名称" class="meeting-search" />
      </div>

      <div class="detail-grid">
        <div class="gallery">
          <AssetVisual :asset="asset" />
          <div class="thumbs">
            <span class="thumb active" />
            <span class="thumb" />
            <span class="thumb" />
          </div>
          <p class="muted">👁 {{ asset.views }} 次围观</p>
        </div>

        <div class="price-panel surface">
          <div class="status-line">
            <StatusTag :value="asset.status" />
            <span>本标的于 {{ formatDateTime(asset.endAt) }} 结束</span>
          </div>
          <h1>{{ asset.name }}</h1>
          <div class="deal-price">
            <span>{{ asset.status === "已成交" ? "成交价" : "当前价" }}</span>
            <strong>{{ formatMoney(asset.currentPrice) }}</strong>
          </div>
          <p class="notice">{{ asset.importantNotice }}</p>
          <div class="stats">
            <span>起拍价 <b>{{ formatMoney(asset.startingPrice) }}</b></span>
            <span>保证金 <b>{{ formatMoney(asset.deposit) }}</b></span>
            <span>加价幅度 <b>{{ formatMoney(asset.increment) }}</b></span>
            <span>剩余 <b>{{ countdown(asset.endAt) }}</b></span>
          </div>
          <div class="bid-box">
            <el-input-number v-model="bidAmount" :min="asset.currentPrice + asset.increment" :step="asset.increment" />
            <el-button type="primary" @click="confirmBid">出价</el-button>
            <el-button @click="confirmDeposit">缴纳保证金</el-button>
            <el-button @click="register">报名</el-button>
          </div>
          <p class="muted">
            报名状态：{{ registration?.applyStatus || "未报名" }} · 保证金：{{ registration?.depositStatus || "未缴纳" }}
          </p>
        </div>

        <aside class="bid-side surface">
          <h3>出价记录</h3>
          <el-table :data="bids" size="small" height="350">
            <el-table-column prop="bidNo" label="竞买号" width="90" />
            <el-table-column prop="amount" label="出价">
              <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="140" />
          </el-table>
          <el-button class="more" size="small">更多</el-button>
        </aside>
      </div>

      <el-tabs class="detail-tabs" type="border-card">
        <el-tab-pane label="重要提示">{{ asset.importantNotice }}</el-tab-pane>
        <el-tab-pane label="公告">
          <RouterLink v-if="notice" :to="`/notices/${notice.id}`">{{ notice.title }}</RouterLink>
          <p>{{ notice?.content }}</p>
        </el-tab-pane>
        <el-tab-pane label="竞买须知">{{ asset.biddingNotice }}</el-tab-pane>
        <el-tab-pane label="标的介绍">{{ asset.description }}</el-tab-pane>
        <el-tab-pane :label="`竞价记录(${bids.length})`">
          <el-table :data="bids">
            <el-table-column prop="bidNo" label="竞买号" />
            <el-table-column prop="bidderName" label="竞买人" />
            <el-table-column prop="amount" label="出价">
              <template #default="{ row }">{{ formatMoney(row.amount) }}</template>
            </el-table-column>
            <el-table-column prop="createdAt" label="出价时间" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>
    <el-empty v-else description="标的不存在" />
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { ElMessageBox } from "element-plus";
import PublicLayout from "@/layouts/PublicLayout.vue";
import AssetVisual from "@/components/AssetVisual.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import { useAuthStore } from "@/stores/auth";
import { countdown, formatDateTime, formatMoney } from "@/utils/format";

const route = useRoute();
const store = useAuctionStore();
const auth = useAuthStore();
const quickKeyword = ref("");
const asset = computed(() => store.findAsset(String(route.params.id)));
const meeting = computed(() => (asset.value?.meetingId ? store.findMeeting(asset.value.meetingId) : undefined));
const notice = computed(() => (asset.value?.announcementId ? store.findNotice(asset.value.announcementId) : undefined));
const registration = computed(() => (asset.value && auth.currentUser ? store.userRegistration(asset.value.id, auth.currentUser.id) : undefined));
const bids = computed(() => (asset.value ? store.bidsForAsset(asset.value.id) : []));
const bidAmount = ref(0);

watchEffect(() => {
  if (asset.value) bidAmount.value = asset.value.currentPrice + asset.value.increment;
});

function ensureBidder() {
  if (!auth.currentUser || auth.role !== "bidder") {
    auth.login("bidder");
  }
}

function register() {
  ensureBidder();
  if (asset.value) store.registerForAsset(asset.value.id, auth.currentUser);
}

async function confirmDeposit() {
  ensureBidder();
  if (!asset.value) return;
  await ElMessageBox.confirm(`确认缴纳 ${formatMoney(asset.value.deposit)} 保证金？`, "缴纳保证金确认", { type: "warning" });
  store.payDeposit(asset.value.id, auth.currentUser);
}

async function confirmBid() {
  ensureBidder();
  if (!asset.value) return;
  await ElMessageBox.confirm(`确认以 ${formatMoney(bidAmount.value)} 出价？末段出价可能触发延时。`, "出价确认", { type: "warning" });
  store.placeBid(asset.value.id, auth.currentUser, bidAmount.value);
}
</script>

<style scoped>
.detail-page {
  padding: 28px 0;
}

.meeting-strip {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  margin-bottom: 18px;
}

.meeting-strip h2 {
  margin: 0 0 8px;
}

.meeting-search {
  width: 320px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 37% 1fr 290px;
  gap: 18px;
  align-items: start;
}

.gallery,
.price-panel,
.bid-side {
  background: #fff;
}

.gallery {
  padding: 0;
}

.thumbs {
  display: flex;
  gap: 8px;
  padding: 14px 0;
}

.thumb {
  width: 64px;
  height: 42px;
  border: 2px solid var(--app-border);
  border-radius: 4px;
  background: var(--app-primary-soft);
}

.thumb.active {
  border-color: var(--app-primary);
}

.price-panel,
.bid-side {
  padding: 18px;
}

.status-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.price-panel h1 {
  margin: 18px 0;
  font-size: 24px;
}

.deal-price {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 20px;
  background: var(--app-surface-muted);
  border-radius: 8px;
}

.deal-price strong {
  color: var(--app-primary);
  font-size: 34px;
}

.notice {
  padding: 12px;
  color: var(--app-primary);
  background: var(--app-primary-weak);
  border-radius: 6px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  color: var(--app-text-soft);
}

.bid-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 18px 0 8px;
}

.bid-side h3 {
  margin-top: 0;
}

.more {
  width: 100%;
  margin-top: 12px;
}

.detail-tabs {
  margin-top: 18px;
}

@media (max-width: 1180px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
