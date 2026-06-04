<template>
  <PublicLayout>
    <section class="page-shell account-page">
      <aside class="account-side">
        <h2>个人中心</h2>
        <button v-for="tab in tabs" :key="tab" :class="{ active: active === tab }" @click="active = tab">{{ tab }}</button>
      </aside>
      <main class="account-main surface">
        <template v-if="active === '我的交易'">
          <h2>我的交易</h2>
          <div class="toolbar filters">
            <el-radio-group v-model="tradeStatus">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="进行中">进行中</el-radio-button>
              <el-radio-button value="即将开始">即将开始</el-radio-button>
              <el-radio-button value="已拍下">已拍下</el-radio-button>
              <el-radio-button value="已结束">已结束</el-radio-button>
              <el-radio-button value="保证金">保证金</el-radio-button>
            </el-radio-group>
          </div>
          <el-table :data="myRows" empty-text="暂无数据">
            <el-table-column prop="name" label="标的名称" />
            <el-table-column prop="bidNo" label="竞买号" />
            <el-table-column prop="assetStatus" label="标的状态" />
            <el-table-column prop="depositStatus" label="保证金" />
            <el-table-column prop="currentPrice" label="当前价">
              <template #default="{ row }">{{ formatMoney(row.currentPrice) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template #default="{ row }">
                <RouterLink :to="`/assets/${row.assetId}`"><el-button size="small" type="primary">查看</el-button></RouterLink>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <template v-else-if="active === '账户安全'">
          <h2>账户安全</h2>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ auth.currentUser?.username }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ auth.currentUser?.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ auth.currentUser?.email || "未绑定" }}</el-descriptions-item>
            <el-descriptions-item label="实名认证">{{ auth.currentUser?.verified ? "已认证" : "未认证" }}</el-descriptions-item>
          </el-descriptions>
          <el-steps :active="safeStep" align-center class="safe-steps">
            <el-step title="验证身份" />
            <el-step title="邮箱验证" />
            <el-step title="绑定成功" />
          </el-steps>
          <div class="safe-box">
            <el-input v-model="captcha" placeholder="图形验证码 1235" />
            <el-input v-model="sms" placeholder="短信验证码 8888" />
            <el-button type="primary" @click="nextSafe">下一步</el-button>
          </div>
        </template>

        <template v-else>
          <h2>我的消息</h2>
          <div v-for="msg in messages" :key="msg.id" class="message" @click="store.markMessageRead(msg.id)">
            <strong>{{ msg.title }}</strong>
            <time>{{ msg.createdAt }}</time>
            <p>{{ msg.content }}</p>
          </div>
          <el-empty v-if="!messages.length" description="暂无消息" />
        </template>
      </main>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { useAuctionStore } from "@/stores/auction";
import { formatMoney } from "@/utils/format";

const auth = useAuthStore();
const store = useAuctionStore();
const tabs = ["账户安全", "我的交易", "我的消息"];
const active = ref("我的交易");
const tradeStatus = ref("");
const safeStep = ref(0);
const captcha = ref("");
const sms = ref("");

onMounted(() => {
  if (!auth.currentUser || auth.role !== "bidder") auth.login("bidder");
});

const myRows = computed(() =>
  store.db.registrations
    .filter((reg) => reg.userId === auth.currentUser?.id)
    .map((reg) => {
      const asset = store.findAsset(reg.assetId);
      return {
        ...reg,
        assetId: reg.assetId,
        name: asset?.name || "-",
        assetStatus: asset?.status || "-",
        currentPrice: asset?.currentPrice || 0
      };
    })
    .filter((row) => !tradeStatus.value || row.assetStatus === tradeStatus.value || row.depositStatus === tradeStatus.value || (tradeStatus.value === "保证金" && row.depositStatus))
);

const messages = computed(() => store.db.messages.filter((msg) => msg.userId === auth.currentUser?.id));

function nextSafe() {
  if (safeStep.value < 2) safeStep.value += 1;
  if (safeStep.value === 2) auth.verifyCurrentUser();
}
</script>

<style scoped>
.account-page {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  padding: 28px 0;
}

.account-side {
  background: #fff;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  overflow: hidden;
}

.account-side h2 {
  margin: 0;
  padding: 18px 22px;
  color: #fff;
  background: var(--app-primary);
}

.account-side button {
  display: block;
  width: 100%;
  padding: 18px 24px;
  text-align: left;
  background: #fff;
  border: 0;
  border-bottom: 1px solid var(--app-border);
  cursor: pointer;
  font-size: 16px;
}

.account-side button.active {
  color: var(--app-primary);
}

.account-main {
  min-height: 640px;
  padding: 24px 28px;
}

.filters {
  margin-bottom: 18px;
}

.safe-steps {
  margin: 30px 0;
}

.safe-box {
  display: grid;
  width: 420px;
  gap: 12px;
  margin: 0 auto;
}

.message {
  padding: 18px 22px;
  margin-bottom: 14px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
}

.message time {
  float: right;
  color: var(--app-text-soft);
}

.message p {
  color: var(--app-primary);
}
</style>
