<template>
  <AdminLayout :scope="scope">
    <div class="admin-card">
      <div class="query-grid">
        <el-form-item label="标的名称"><el-input v-model="query.name" /></el-form-item>
        <el-form-item label="所属交易会"><el-input v-model="query.meeting" /></el-form-item>
        <el-form-item label="结束时间"><el-date-picker v-model="query.endAt" type="daterange" start-placeholder="开始" end-placeholder="结束" /></el-form-item>
        <el-form-item label="拍卖状态"><el-select v-model="query.status" clearable><el-option v-for="s in statuses" :key="s" :label="s" :value="s" /></el-select></el-form-item>
        <el-form-item label="标的类型"><el-select v-model="query.assetType" clearable><el-option v-for="t in assetTypes" :key="t" :label="t" :value="t" /></el-select></el-form-item>
        <div class="query-actions">
          <el-button type="primary" :icon="Search">查询</el-button>
          <el-button :icon="Refresh" @click="reset">清除</el-button>
        </div>
      </div>
      <div class="table-actions">
        <el-button type="primary" @click="openDrawer()">新增</el-button>
        <el-button :icon="Download" @click="downloadTextFile('标的列表.txt', JSON.stringify(rows, null, 2))">导出</el-button>
        <el-tag type="success" effect="plain">共享数据：前台列表/详情/交易大厅同步</el-tag>
      </div>
      <el-table :data="rows" border height="520" highlight-current-row>
        <el-table-column type="selection" width="48" />
        <el-table-column prop="name" label="标的名称" min-width="180" />
        <el-table-column prop="code" label="标的编号" width="110" />
        <el-table-column prop="address" label="详细地址" min-width="150" />
        <el-table-column prop="startingPrice" label="起拍价" width="130">
          <template #default="{ row }">{{ formatMoney(row.startingPrice) }}</template>
        </el-table-column>
        <el-table-column prop="increment" label="加价幅度" width="120">
          <template #default="{ row }">{{ formatMoney(row.increment) }}</template>
        </el-table-column>
        <el-table-column prop="deposit" label="保证金" width="120">
          <template #default="{ row }">{{ formatMoney(row.deposit) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="标的状态" width="110">
          <template #default="{ row }"><StatusTag :value="row.status" /></template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核" width="100">
          <template #default="{ row }"><StatusTag :value="row.auditStatus" /></template>
        </el-table-column>
        <el-table-column prop="publishStatus" label="发布" width="100">
          <template #default="{ row }"><StatusTag :value="row.publishStatus" /></template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="340">
          <template #default="{ row }">
            <div class="text-button-row">
              <el-button size="small" @click="openDrawer(row)">查看</el-button>
              <el-button size="small" type="primary" @click="openDrawer(row)">编辑</el-button>
              <el-button size="small" type="success" @click="store.submitAsset(row.id)">提交</el-button>
              <el-button size="small" type="success" @click="store.auditAsset(row.id, true)">审核</el-button>
              <el-button size="small" type="primary" @click="confirmPublish(row.id)">发布</el-button>
              <el-button size="small" type="warning" @click="confirmWithdraw(row.id)">撤回</el-button>
              <el-button size="small" type="danger" @click="confirmTerminate(row.id)">终止</el-button>
              <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :page-size="20" layout="prev, pager, next, jumper, total, sizes" :total="rows.length" />
    </div>

    <el-drawer v-model="drawerVisible" title="数据编辑" size="70%">
      <el-form v-if="form" :model="form" label-width="140px" class="drawer-form">
        <h2>标的信息</h2>
        <el-form-item label="标的名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="标的序号"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="资产分类"><el-select v-model="form.assetType"><el-option v-for="t in assetTypes" :key="t" :label="t" :value="t" /></el-select></el-form-item>
        <el-form-item label="二级分类"><el-input v-model="form.subCategory" /></el-form-item>
        <el-form-item label="所在省市"><el-input v-model="form.region" /></el-form-item>
        <el-form-item label="详细地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="是否缴纳保证金"><el-radio-group v-model="depositRequired"><el-radio value="不缴纳">不缴纳</el-radio><el-radio value="缴纳">缴纳</el-radio></el-radio-group></el-form-item>
        <el-form-item label="保证金"><el-input-number v-model="form.deposit" :min="0" /></el-form-item>
        <el-form-item label="起拍价"><el-input-number v-model="form.startingPrice" :min="0" /></el-form-item>
        <el-form-item label="加价幅度"><el-input-number v-model="form.increment" :min="1" /></el-form-item>
        <el-form-item label="优先购买权"><el-switch v-model="form.priorityRight" /></el-form-item>
        <el-form-item label="标的介绍"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="标的图片">
          <el-upload action="#" :auto-upload="false"><el-button type="primary">上传文件</el-button></el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-drawer>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { Download, Refresh, Search } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import AdminLayout from "@/layouts/AdminLayout.vue";
import StatusTag from "@/components/StatusTag.vue";
import { useAuctionStore } from "@/stores/auction";
import type { Asset } from "@/types";
import { downloadTextFile, formatMoney } from "@/utils/format";

const route = useRoute();
const store = useAuctionStore();
const scope = computed(() => String(route.meta.scope || "platform") as "merchant" | "platform");
const method = computed(() => String(route.meta.method || "竞价"));
const drawerVisible = ref(false);
const form = ref<Asset | null>(null);
const depositRequired = ref("缴纳");
const query = reactive({ name: "", meeting: "", status: "", assetType: "", endAt: "" });
const statuses = ["即将开始", "进行中", "已结束", "已成交", "已流拍", "已撤拍", "已终止", "已下架"];
const assetTypes = ["机动车", "房产", "工业循环物资", "无形资产", "股权债权", "其他资产"];
const rows = computed(() =>
  store.db.assets.filter((asset) => {
    const meeting = asset.meetingId ? store.findMeeting(asset.meetingId) : undefined;
    return (
      asset.method === method.value &&
      (!query.name || asset.name.includes(query.name)) &&
      (!query.meeting || meeting?.name.includes(query.meeting)) &&
      (!query.status || asset.status === query.status) &&
      (!query.assetType || asset.assetType === query.assetType)
    );
  })
);

function reset() {
  Object.assign(query, { name: "", meeting: "", status: "", assetType: "", endAt: "" });
}

function openDrawer(row?: Asset) {
  const base = store.db.assets[0];
  form.value = row
    ? { ...row }
    : {
        ...base,
        id: "",
        code: "",
        name: method.value === "挂牌" ? "新增挂牌标的" : "新增竞价标的",
        method: method.value as Asset["method"],
        status: "即将开始",
        auditStatus: "待提交",
        publishStatus: "待发布"
      };
  drawerVisible.value = true;
}

function save() {
  if (!form.value) return;
  store.saveAsset(form.value);
  drawerVisible.value = false;
}

async function confirmPublish(id: string) {
  await ElMessageBox.confirm("确认发布该标的？发布后前台列表和交易大厅立即可见。", "发布确认", { type: "warning" });
  store.publishAsset(id);
}

async function confirmWithdraw(id: string) {
  await ElMessageBox.confirm("确认撤回该标的？已缴纳保证金将模拟退还。", "撤回确认", { type: "warning" });
  store.withdrawAsset(id);
}

async function confirmDelete(id: string) {
  await ElMessageBox.confirm("确认删除该标的？相关报名和竞价记录将同步移除。", "删除确认", { type: "error" });
  store.deleteAsset(id);
}

async function confirmTerminate(id: string) {
  await ElMessageBox.confirm("第一次确认：标的终止后前台将同步显示已终止。", "终止确认 1/3", { type: "warning" });
  await ElMessageBox.confirm("第二次确认：已缴纳保证金将模拟退还。", "终止确认 2/3", { type: "warning" });
  await ElMessageBox.prompt("第三次确认：请输入终止原因", "终止确认 3/3", { inputValue: "终止申请，请注意操作！" });
  store.terminateAsset(id, "终止申请，请注意操作！");
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
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 12px 28px;
  align-items: end;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--app-border);
}

.query-actions,
.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.table-actions {
  margin: 14px 0;
}

.drawer-form {
  max-width: 1100px;
}
</style>
