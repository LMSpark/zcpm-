<template>
  <PublicLayout>
    <section class="page-shell hall-page">
      <h1>交易大厅</h1>
      <div class="filter-panel">
        <el-radio-group v-model="commissionType">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="司法委托">司法委托</el-radio-button>
          <el-radio-button value="政府委托">政府委托</el-radio-button>
          <el-radio-button value="海关委托">海关委托</el-radio-button>
          <el-radio-button value="金融资产机构委托">金融资产机构委托</el-radio-button>
          <el-radio-button value="生产企业委托">生产企业委托</el-radio-button>
          <el-radio-button value="个人委托">个人委托</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="status">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="正在进行">正在进行</el-radio-button>
          <el-radio-button value="即将开始">即将开始</el-radio-button>
          <el-radio-button value="已结束">已结束</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="refreshAt = Date.now()">刷新交易状态</el-button>
      </div>
      <div class="meeting-list">
        <div v-for="meeting in filtered" :key="meeting.id" class="meeting-card surface">
          <AssetVisual :asset="firstAsset(meeting.id) || store.db.assets[0]" />
          <div class="meeting-copy">
            <h2>{{ meeting.name }}</h2>
            <p>交易企业：{{ meeting.enterprise }}</p>
            <p>{{ formatDateTime(meeting.startAt) }} 开始　{{ meeting.status }}</p>
            <div class="buttons">
              <RouterLink :to="`/hall/${meeting.id}`"><el-button type="primary">标的目录</el-button></RouterLink>
              <RouterLink :to="`/hall/${meeting.id}`"><el-button type="primary">交易大厅</el-button></RouterLink>
            </div>
            <footer>标的数量：{{ meeting.assetIds.length }} 个</footer>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PublicLayout from "@/layouts/PublicLayout.vue";
import AssetVisual from "@/components/AssetVisual.vue";
import { useAuctionStore } from "@/stores/auction";
import { formatDateTime } from "@/utils/format";

const store = useAuctionStore();
const commissionType = ref("");
const status = ref("");
const refreshAt = ref(Date.now());
const filtered = computed(() =>
  store.db.meetings.filter((meeting) => {
    void refreshAt.value;
    const assets = meeting.assetIds.map((id) => store.findAsset(id)).filter(Boolean);
    const byCommission = !commissionType.value || assets.some((asset) => asset?.commissionType === commissionType.value);
    const byStatus = !status.value || meeting.status === status.value.replace("正在进行", "进行中");
    return byCommission && byStatus;
  })
);
const firstAsset = (meetingId: string) => store.db.assets.find((asset) => asset.meetingId === meetingId);
</script>

<style scoped>
.hall-page {
  padding: 28px 0;
}

.filter-panel {
  display: grid;
  gap: 12px;
  padding: 18px;
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.meeting-list {
  display: grid;
  gap: 20px;
}

.meeting-card {
  display: grid;
  grid-template-columns: minmax(360px, 2fr) 1fr;
  overflow: hidden;
}

.meeting-copy {
  display: grid;
  align-content: center;
  gap: 12px;
  padding: 28px;
}

.meeting-copy h2 {
  margin: 0;
}

.buttons {
  display: flex;
  gap: 12px;
}

footer {
  margin: 10px -28px -28px;
  padding: 14px 28px;
  background: var(--app-surface-muted);
}

@media (max-width: 900px) {
  .meeting-card {
    grid-template-columns: 1fr;
  }
}
</style>
