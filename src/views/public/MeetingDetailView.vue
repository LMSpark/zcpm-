<template>
  <PublicLayout>
    <section v-if="meeting" class="page-shell hall-detail">
      <div class="surface header">
        <div>
          <h1>{{ meeting.name }}</h1>
          <p>{{ meeting.enterprise }} · {{ meeting.type }} · {{ meeting.status }}</p>
        </div>
        <el-input v-model="keyword" placeholder="名称 请输入本场交易会的标的名称" />
      </div>
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
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import PublicLayout from "@/layouts/PublicLayout.vue";
import AssetVisual from "@/components/AssetVisual.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Asset } from "@/types";
import { formatMoney } from "@/utils/format";

const route = useRoute();
const store = useAuctionStore();
const keyword = ref("");
const meeting = computed(() => store.findMeeting(String(route.params.id)));
const assets = computed(() =>
  (meeting.value?.assetIds || [])
    .map((id) => store.findAsset(id))
    .filter((asset): asset is Asset => asset !== undefined && (!keyword.value || asset.name.includes(keyword.value)))
);
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
