<template>
  <PublicLayout>
    <section class="page-shell list-page">
      <h1>{{ title }}</h1>
      <div class="filter-panel">
        <div v-for="group in filters" :key="group.key" class="filter-row">
          <span>{{ group.label }}</span>
          <el-check-tag
            v-for="option in group.options"
            :key="option"
            :checked="filterState[group.key] === option"
            @change="filterState[group.key] = filterState[group.key] === option ? '' : option"
          >
            {{ option || "全部" }}
          </el-check-tag>
        </div>
        <div class="price-row">
          <span>价格</span>
          <el-input-number v-model="minPrice" :min="0" controls-position="right" placeholder="最低价" />
          <el-input-number v-model="maxPrice" :min="0" controls-position="right" placeholder="最高价" />
          <el-radio-group v-model="sortBy">
            <el-radio-button value="默认">默认</el-radio-button>
            <el-radio-button value="价格">价格</el-radio-button>
            <el-radio-button value="出价次数">出价次数</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="list-toolbar">
        <span>共 {{ filtered.length }} 个标的，多端共享实时状态</span>
        <el-button :icon="Refresh" @click="reset">重置筛选</el-button>
      </div>

      <div class="asset-list">
        <RouterLink v-for="asset in paged" :key="asset.id" class="asset-row" :to="`/assets/${asset.id}`">
          <AssetVisual :asset="asset" />
          <div class="asset-info">
            <div class="title-line">
              <h2>{{ asset.name }}</h2>
              <StatusTag :value="asset.status" />
            </div>
            <p>{{ asset.seller }} · {{ asset.region }} · {{ asset.commissionType }}</p>
            <div class="meta-grid">
              <span>起拍价 <b>{{ formatMoney(asset.startingPrice) }}</b></span>
              <span>当前价 <b class="price">{{ formatMoney(asset.currentPrice) }}</b></span>
              <span>保证金 <b>{{ formatMoney(asset.deposit) }}</b></span>
              <span>加价幅度 <b>{{ formatMoney(asset.increment) }}</b></span>
            </div>
            <div class="meta-grid">
              <span>开始 {{ formatDateTime(asset.startAt) }}</span>
              <span>结束 {{ formatDateTime(asset.endAt) }}</span>
              <span>报名/保证金/竞价数据与后台同步</span>
            </div>
          </div>
          <div class="row-actions">
            <el-button type="primary">查看详情</el-button>
          </div>
        </RouterLink>
      </div>
      <el-pagination v-model:current-page="page" :page-size="pageSize" layout="prev, pager, next, jumper, total" :total="filtered.length" />
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Refresh } from "@element-plus/icons-vue";
import PublicLayout from "@/layouts/PublicLayout.vue";
import AssetVisual from "@/components/AssetVisual.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import { formatDateTime, formatMoney } from "@/utils/format";

const route = useRoute();
const store = useAuctionStore();
const method = computed(() => String(route.meta.method || "竞价"));
const title = computed(() => String(route.meta.title || "标的列表"));
const minPrice = ref<number | undefined>();
const maxPrice = ref<number | undefined>();
const sortBy = ref("默认");
const page = ref(1);
const pageSize = 6;
const filterState = reactive<Record<string, string>>({
  assetType: "",
  region: "",
  commissionType: "",
  status: "",
  startAt: ""
});

const filters = [
  { key: "assetType", label: "标的类型", options: ["", "机动车", "房产", "工业循环物资", "无形资产", "股权债权", "其他资产"] },
  { key: "region", label: "标的所在地", options: ["", "湖北省 武汉市", "湖北省 宜昌市", "湖北省 黄石市"] },
  { key: "commissionType", label: "委托类型", options: ["", "司法委托", "政府委托", "金融资产机构委托", "生产企业委托", "个人委托", "其他机构委托"] },
  { key: "status", label: "标的状态", options: ["", "正在进行", "即将开始", "已成交", "已流拍", "已撤拍"] },
  { key: "startAt", label: "开始时间", options: ["", "未来3天", "未来7天", "未来15天"] }
];

const filtered = computed(() => {
  const keyword = String(route.query.keyword || "");
  let rows = store.publishedAssets.filter((asset) => asset.method === method.value);
  if (keyword) rows = rows.filter((asset) => asset.name.includes(keyword) || asset.code.includes(keyword));
  if (filterState.assetType) rows = rows.filter((asset) => asset.assetType === filterState.assetType);
  if (filterState.region) rows = rows.filter((asset) => asset.region === filterState.region);
  if (filterState.commissionType) rows = rows.filter((asset) => asset.commissionType === filterState.commissionType);
  if (filterState.status) rows = rows.filter((asset) => asset.status === filterState.status.replace("正在进行", "进行中"));
  if (minPrice.value !== undefined) rows = rows.filter((asset) => asset.currentPrice >= Number(minPrice.value));
  if (maxPrice.value !== undefined && maxPrice.value > 0) rows = rows.filter((asset) => asset.currentPrice <= Number(maxPrice.value));
  if (sortBy.value === "价格") rows = [...rows].sort((a, b) => b.currentPrice - a.currentPrice);
  if (sortBy.value === "出价次数") rows = [...rows].sort((a, b) => store.bidsForAsset(b.id).length - store.bidsForAsset(a.id).length);
  return rows;
});

const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize));

watch(filtered, () => {
  page.value = 1;
});

function reset() {
  Object.keys(filterState).forEach((key) => (filterState[key] = ""));
  minPrice.value = undefined;
  maxPrice.value = undefined;
  sortBy.value = "默认";
}
</script>

<style scoped>
.list-page {
  padding: 28px 0;
}

h1 {
  margin: 0 0 18px;
}

.filter-panel {
  background: #fff;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  overflow: hidden;
}

.filter-row,
.price-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--app-border);
}

.filter-row > span,
.price-row > span {
  width: 100px;
  color: var(--app-text-soft);
}

.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 18px 0;
}

.asset-list {
  display: grid;
  gap: 16px;
  margin-bottom: 18px;
}

.asset-row {
  display: grid;
  grid-template-columns: 250px 1fr 120px;
  gap: 20px;
  align-items: center;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.asset-row:hover {
  border-color: var(--app-primary);
  box-shadow: var(--app-shadow);
}

.title-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-line h2 {
  margin: 0;
  font-size: 22px;
}

.asset-info p,
.meta-grid {
  color: var(--app-text-soft);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 960px) {
  .asset-row {
    grid-template-columns: 1fr;
  }

  .meta-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
