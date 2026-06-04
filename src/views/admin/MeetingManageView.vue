<template>
  <AdminLayout :scope="scope">
    <div class="admin-card">
      <div class="query-grid">
        <el-form-item label="交易会名称"><el-input v-model="keyword" /></el-form-item>
        <el-form-item label="交易会状态"><el-select v-model="status" clearable><el-option v-for="s in statuses" :key="s" :label="s" :value="s" /></el-select></el-form-item>
        <el-form-item label="交易时间"><el-date-picker type="daterange" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <div><el-button type="primary" :icon="Search">查询</el-button><el-button :icon="Refresh" @click="keyword = status = ''">清除</el-button></div>
      </div>
      <div class="child-actions">
        <el-button type="primary" @click="openDrawer()">新增交易会</el-button>
      </div>
      <el-tabs type="card" class="tabs">
        <el-tab-pane label="交易会列表">
          <el-table :data="rows" border height="360" highlight-current-row @current-change="selected = $event">
            <el-table-column type="selection" width="48" />
            <el-table-column prop="code" label="交易会编号" width="120" />
            <el-table-column prop="name" label="交易会名称" min-width="180" />
            <el-table-column prop="startAt" label="开始时间" width="170" />
            <el-table-column prop="status" label="交易会状态" width="120"><template #default="{ row }"><StatusTag :value="row.status" /></template></el-table-column>
            <el-table-column prop="publishStatus" label="发布状态" width="120"><template #default="{ row }"><StatusTag :value="row.publishStatus" /></template></el-table-column>
            <el-table-column label="操作" width="520" fixed="right">
              <template #default="{ row }">
                <div class="text-button-row">
                  <el-button size="small" @click="selected = row">查看</el-button>
                  <el-button size="small" type="primary" @click="openDrawer(row)">编辑</el-button>
                  <el-button size="small" type="success" @click="confirmMeeting(row.id, 'publish')">发布</el-button>
                  <el-button size="small" type="warning" @click="confirmMeeting(row.id, 'withdraw')">撤回</el-button>
                  <el-button size="small" @click="confirmMeeting(row.id, 'end')">结束</el-button>
                  <el-button size="small" @click="confirmMeeting(row.id, 'archive')">归档</el-button>
                  <RouterLink :to="`/hall/${row.id}`" target="_blank"><el-button size="small" type="primary">预览</el-button></RouterLink>
                  <el-button size="small" @click="download(row, '成交信息')">下载成交信息</el-button>
                  <el-button size="small" @click="download(row, '竞买人信息')">下载竞买人信息</el-button>
                  <el-button size="small" @click="download(row, '档案')">下载档案</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <div class="child-panel">
        <div class="child-actions">
          <el-button type="primary" @click="download(selected, 'PDF模板')">PDF模板</el-button>
          <el-button type="primary" @click="download(selected, 'Excel模板')">Excel模板</el-button>
          <el-button @click="download(selected, '标的成交确认书pdf')">标的成交确认书 PDF</el-button>
          <el-button @click="download(selected, '交易会成交信息pdf')">交易会成交信息 PDF</el-button>
        </div>
        <el-table :data="selectedAssets" border>
          <el-table-column prop="name" label="标的名称" />
          <el-table-column prop="deposit" label="保证金"><template #default="{ row }">{{ formatMoney(row.deposit) }}</template></el-table-column>
          <el-table-column prop="startingPrice" label="起拍价"><template #default="{ row }">{{ formatMoney(row.startingPrice) }}</template></el-table-column>
          <el-table-column prop="status" label="标的状态" />
          <el-table-column prop="currentPrice" label="成交价"><template #default="{ row }">{{ row.status === "已成交" ? formatMoney(row.currentPrice) : "-" }}</template></el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="{ row }">
              <el-button size="small" @click="download(row, '竞价记录')">竞价记录</el-button>
              <el-button size="small" @click="download(row, '成交信息')">成交信息</el-button>
              <el-button size="small" @click="download(row, '下载成交确认书')">下载成交确认书</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-drawer v-model="drawerVisible" title="交易会维护" size="70%">
      <el-form v-if="form" :model="form" label-width="130px">
        <el-form-item label="交易会名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="交易会类型"><el-input v-model="form.type" /></el-form-item>
        <el-form-item label="交易企业"><el-input v-model="form.enterprise" /></el-form-item>
        <el-form-item label="开始时间"><el-input v-model="form.startAt" /></el-form-item>
        <el-form-item label="结束时间"><el-input v-model="form.endAt" /></el-form-item>
        <el-form-item label="关联标的"><el-select v-model="form.assetIds" multiple><el-option v-for="asset in store.db.assets" :key="asset.id" :label="asset.name" :value="asset.id" /></el-select></el-form-item>
        <el-form-item label="交易规则"><el-input v-model="form.rules" type="textarea" :rows="4" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="drawerVisible = false">取消</el-button><el-button type="primary" @click="saveMeeting">保存</el-button></template>
    </el-drawer>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Refresh, Search } from "@element-plus/icons-vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Meeting } from "@/types";
import { downloadPdf, downloadXlsx } from "@/utils/download";
import { formatMoney } from "@/utils/format";
import { confirmWithReason } from "@/utils/workflow";

const route = useRoute();
const store = useAuctionStore();
const scope = computed(() => String(route.meta.scope || "platform") as "merchant" | "platform");
const keyword = ref("");
const status = ref("");
const drawerVisible = ref(false);
const form = ref<Meeting | undefined>();
const statuses = ["即将开始", "进行中", "已结束", "已归档"];
const rows = computed(() => store.db.meetings.filter((meeting) => (!keyword.value || meeting.name.includes(keyword.value)) && (!status.value || meeting.status === status.value)));
const selected = ref<Meeting | undefined>(store.db.meetings[0]);
const selectedAssets = computed(() => (selected.value?.assetIds || []).map((id) => store.findAsset(id)).filter(Boolean));

function download(target: unknown, name: string) {
  const meeting = "assetIds" in ((target || {}) as Record<string, unknown>) ? (target as Meeting) : selected.value;
  const assets = meeting ? meeting.assetIds.map((id) => store.findAsset(id)).filter(Boolean) : selectedAssets.value;
  if (name.toLowerCase().includes("pdf") || name.includes("确认书")) {
    downloadPdf(`${name}.pdf`, name, assets.map((asset) => ({ 标的: asset?.name, 状态: asset?.status, 成交价: asset?.currentPrice, 买受人: asset?.winner || "-" })));
    return;
  }
  downloadXlsx(`${name}.xlsx`, {
    [name]: assets.map((asset) => ({
      标的编号: asset?.code,
      标的名称: asset?.name,
      状态: asset?.status,
      成交价: asset?.currentPrice,
      买受人: asset?.winner || "-",
      保证金: asset?.deposit
    })),
    竞买人信息: store.db.registrations
      .filter((reg) => assets.some((asset) => asset?.id === reg.assetId))
      .map((reg) => ({ 姓名: reg.name, 竞买号: reg.bidNo, 手机号: reg.phone, 审核: reg.applyStatus, 保证金: reg.depositStatus }))
  });
}

function openDrawer(row?: Meeting) {
  form.value = row
    ? { ...row, assetIds: [...row.assetIds] }
    : {
        id: "",
        code: "",
        name: "新增交易会",
        type: "网络拍",
        status: "即将开始",
        publishStatus: "待发布",
        startAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        endAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 19).replace("T", " "),
        announcementTitle: "新增交易公告",
        enterprise: "中楚拍卖平台",
        assetIds: [],
        rules: "竞买人须完成实名认证、报名审核和保证金缴纳后进入交易。",
        archiveStatus: "未归档"
      };
  drawerVisible.value = true;
}

function saveMeeting() {
  if (!form.value) return;
  store.saveMeeting({ ...form.value, id: form.value.id || store.generateId("meet") });
  drawerVisible.value = false;
}

async function confirmMeeting(id: string, action: "publish" | "withdraw" | "end" | "archive") {
  const labels = { publish: "发布交易会", withdraw: "撤回交易会", end: "结束交易会", archive: "归档交易会" };
  const reason = await confirmWithReason(labels[action], `确认${labels[action]}？`, labels[action]);
  if (!reason) return;
  if (action === "publish") store.publishMeeting(id, reason);
  if (action === "withdraw") store.withdrawMeeting(id, reason);
  if (action === "end") store.endMeeting(id, reason);
  if (action === "archive") store.archiveMeeting(id, reason);
}
</script>

<style scoped>
.admin-card {
  padding: 18px;
  background: #fff;
  border: 1px solid var(--app-border);
}

.query-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr)) auto;
  gap: 14px;
}

.tabs {
  margin-top: 12px;
}

.child-panel {
  margin-top: 16px;
}

.child-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}
</style>
