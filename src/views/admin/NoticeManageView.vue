<template>
  <AdminLayout :scope="scope">
    <div class="admin-card">
      <div class="query-grid">
        <el-form-item label="公告名称"><el-input v-model="keyword" /></el-form-item>
        <el-form-item label="发布状态"><el-select v-model="publishStatus" clearable><el-option v-for="s in publishStatuses" :key="s" :label="s" :value="s" /></el-select></el-form-item>
        <el-form-item label="审核状态"><el-select v-model="auditStatus" clearable><el-option v-for="s in auditStatuses" :key="s" :label="s" :value="s" /></el-select></el-form-item>
        <div class="query-actions">
          <el-button type="primary" :icon="Search">查询</el-button>
          <el-button :icon="Refresh" @click="keyword = publishStatus = auditStatus = ''">清除</el-button>
        </div>
      </div>
      <div class="table-actions">
        <el-button type="primary" @click="openDrawer()">新增</el-button>
        <el-button :icon="Download" @click="exportRows">导出</el-button>
      </div>
      <el-table :data="rows" border height="540">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="title" label="公告标题" min-width="180" />
        <el-table-column prop="code" label="公告编号" width="110" />
        <el-table-column prop="createdAt" label="提交时间" width="170" />
        <el-table-column prop="mediaPublished" label="商网媒体公告" width="140">
          <template #default="{ row }">{{ row.mediaPublished ? "是" : "否" }}</template>
        </el-table-column>
        <el-table-column prop="publishedAt" label="发布时间" width="170" />
        <el-table-column prop="status" label="审核" width="100">
          <template #default="{ row }"><StatusTag :value="row.status" /></template>
        </el-table-column>
        <el-table-column prop="publishStatus" label="发布状态" width="110">
          <template #default="{ row }"><StatusTag :value="row.publishStatus" /></template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="310">
          <template #default="{ row }">
            <div class="text-button-row">
              <el-button size="small" @click="openDrawer(row)">查看</el-button>
              <RouterLink :to="`/notices/${row.id}`" target="_blank"><el-button size="small" type="primary">预览</el-button></RouterLink>
              <el-button size="small" type="success" @click="confirmSubmit(row.id)">提交</el-button>
              <el-button size="small" type="success" @click="confirmAudit(row.id, true)">审核</el-button>
              <el-button size="small" type="danger" @click="confirmAudit(row.id, false)">驳回</el-button>
              <el-button size="small" type="primary" @click="confirmPublish(row.id)">发布</el-button>
              <el-button size="small" type="warning" @click="confirmWithdraw(row.id)">申请驳回</el-button>
              <el-button v-if="noticeType.includes('挂牌')" size="small" type="danger" @click="confirmOffShelf(row.id)">下架</el-button>
              <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-drawer v-model="drawerVisible" title="数据编辑" size="70%">
      <el-form v-if="form" :model="form" label-width="120px">
        <el-form-item label="类型"><el-input v-model="form.type" disabled /></el-form-item>
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="栏目分类"><el-select v-model="form.contentCategory" clearable><el-option v-for="category in contentCategories" :key="category.id" :label="category.name" :value="category.name" /></el-select></el-form-item>
        <el-form-item label="置顶"><el-switch v-model="form.pinned" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="1" /></el-form-item>
        <el-form-item label="关联标的"><el-select v-model="form.relatedAssetId" clearable><el-option v-for="asset in store.db.assets" :key="asset.id" :label="asset.name" :value="asset.id" /></el-select></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="8" /></el-form-item>
        <el-form-item label="最近意见"><el-input :model-value="form.reviewReason || form.rejectReason || '暂无'" disabled /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-drawer>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { Download, Refresh, Search } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import AdminLayout from "@/layouts/AdminLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Notice } from "@/types";
import { downloadXlsx } from "@/utils/download";
import { confirmWithReason } from "@/utils/workflow";

const route = useRoute();
const store = useAuctionStore();
const scope = computed(() => String(route.meta.scope || "platform") as "merchant" | "platform");
const noticeType = computed(() => String(route.meta.noticeType || "交易公告"));
const title = computed(() => String(route.meta.title || "公告管理"));
const keyword = ref("");
const publishStatus = ref("");
const auditStatus = ref("");
const drawerVisible = ref(false);
const form = ref<Notice | null>(null);
const publishStatuses = ["待发布", "发布中", "已发布", "已撤回", "已下架"];
const auditStatuses = ["待提交", "待审核", "已审核", "已驳回"];
const rows = computed(() =>
  store.db.notices.filter((notice) => notice.type === noticeType.value && (!keyword.value || notice.title.includes(keyword.value)) && (!publishStatus.value || notice.publishStatus === publishStatus.value) && (!auditStatus.value || notice.status === auditStatus.value))
);
const contentCategories = computed(() =>
  store.db.resourceCategories.filter((category) => category.enabled !== false && ((noticeType.value === "新闻" && category.type === "新闻分类") || (noticeType.value === "帮助" && category.type === "帮助分类")))
);

function openDrawer(row?: Notice) {
  form.value = row
    ? { ...row }
    : {
        id: "",
        title: `新增${noticeType.value}`,
        code: "",
        type: noticeType.value as Notice["type"],
        content: "",
        status: "待提交",
        publishStatus: "待发布",
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        mediaPublished: false,
        contentCategory: contentCategories.value[0]?.name || noticeType.value,
        pinned: false,
        sort: rows.value.length + 1
      };
  drawerVisible.value = true;
}

function save() {
  if (!form.value) return;
  store.saveNotice(form.value);
  drawerVisible.value = false;
}

async function confirmPublish(id: string) {
  const reason = await confirmWithReason("发布确认", "确认发布？发布后公共详情页和前台栏目立即同步。", "发布到前台");
  if (!reason) return;
  store.publishNotice(id, reason);
}

async function confirmWithdraw(id: string) {
  const reason = await confirmWithReason("撤回确认", "确认申请驳回/撤回该内容？", "内容撤回");
  if (!reason) return;
  store.withdrawNotice(id, reason);
}

async function confirmOffShelf(id: string) {
  const reason = await confirmWithReason("下架确认", "确认下架？关联挂牌标的将同步下架。", "挂牌内容下架");
  if (!reason) return;
  store.offShelfNotice(id, reason);
}

async function confirmDelete(id: string) {
  await ElMessageBox.confirm("确认删除该内容？", "删除确认", { type: "error" });
  store.removeNotice(id);
}

async function confirmSubmit(id: string) {
  const reason = await confirmWithReason("提交审核", "确认提交该内容进入审核？", "提交审核");
  if (!reason) return;
  store.submitNotice(id, reason);
}

async function confirmAudit(id: string, pass: boolean) {
  const reason = await confirmWithReason(pass ? "审核通过" : "审核驳回", pass ? "确认审核通过该内容？" : "确认驳回该内容？", pass ? "内容符合发布要求" : "资料需补充");
  if (!reason) return;
  store.auditNotice(id, pass, reason);
}

function exportRows() {
  downloadXlsx(`${title.value}.xlsx`, {
    [title.value]: rows.value.map((row) => ({
      标题: row.title,
      编号: row.code,
      类型: row.type,
      审核状态: row.status,
      发布状态: row.publishStatus,
      栏目分类: row.contentCategory || "",
      发布时间: row.publishedAt || ""
    }))
  });
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
  gap: 12px 24px;
  align-items: end;
}

.query-actions,
.table-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-actions {
  margin: 14px 0;
}
</style>
