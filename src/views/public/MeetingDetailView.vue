<template>
  <PublicLayout>
    <section v-if="meeting" class="page-shell hall-detail">
      <div class="surface header">
        <div>
          <h1>{{ meeting.name }}</h1>
          <p>{{ meeting.enterprise }} · {{ meeting.type }} · {{ meeting.status }}</p>
          <p class="muted">交易规则：{{ meeting.rules }}</p>
        </div>
        <el-input v-model="keyword" placeholder="名称 请输入本场交易会的标的名称" />
      </div>
      <el-alert title="进入条件：竞买人需完成实名认证、报名审核和保证金缴纳；页面支持手动刷新交易状态。" type="info" show-icon :closable="false" />
      <el-tabs type="border-card">
        <el-tab-pane label="标的目录">
          <div class="asset-grid">
            <RouterLink v-for="asset in assets" :key="asset.id" class="mini-asset" :to="`/assets/${asset.id}`">
              <AssetVisual :asset="asset" />
              <h3>{{ asset.name }}</h3>
              <p class="price">{{ formatMoney(asset.currentPrice) }}</p>
            </RouterLink>
          </div>
        </el-tab-pane>
        <el-tab-pane label="交易大厅">
          <el-table :data="assets">
            <el-table-column prop="name" label="标的名称" />
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="currentPrice" label="当前价">
              <template #default="{ row }">{{ formatMoney(row.currentPrice) }}</template>
            </el-table-column>
            <el-table-column prop="endAt" label="结束时间" />
            <el-table-column label="倒计时">
              <template #default="{ row }">{{ countdown(row.endAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="130">
              <template #default="{ row }">
                <RouterLink :to="`/assets/${row.id}`"><el-button size="small" type="primary">进入</el-button></RouterLink>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import PublicLayout from "@/layouts/PublicLayout.vue";
import AssetVisual from "@/components/AssetVisual.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Asset } from "@/types";
import { countdown, formatMoney } from "@/utils/format";

const route = useRoute();
const store = useAuctionStore();
const keyword = ref("");
const refreshTick = ref(Date.now());
const meeting = computed(() => store.findMeeting(String(route.params.id)));
const assets = computed(() =>
  (meeting.value?.assetIds || [])
    .map((id) => store.findAsset(id))
    .filter((asset): asset is Asset => {
      void refreshTick.value;
      return asset !== undefined && (!keyword.value || asset.name.includes(keyword.value));
    })
);
const timer = window.setInterval(() => {
  refreshTick.value = Date.now();
}, 1000);

onUnmounted(() => {
  window.clearInterval(timer);
});
</script>

<style scoped>
.hall-detail {
  padding: 28px 0;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  margin-bottom: 18px;
}

.header .el-input {
  width: 360px;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.mini-asset {
  display: block;
  padding: 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
}
</style>
