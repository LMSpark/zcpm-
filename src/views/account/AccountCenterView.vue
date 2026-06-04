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
            <el-input v-model="nextPhone" placeholder="绑定手机号" />
            <el-input v-model="nextEmail" placeholder="绑定邮箱" />
            <el-input v-model="nextPassword" placeholder="新密码" show-password />
            <el-button type="primary" @click="nextSafe">下一步</el-button>
            <el-button @click="saveSecurity">保存账户安全信息</el-button>
          </div>
        </template>

        <template v-else>
          <h2>我的消息</h2>
          <div class="toolbar filters">
            <el-radio-group v-model="messageCategory">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="交易">交易</el-radio-button>
              <el-radio-button value="审核">审核</el-radio-button>
              <el-radio-button value="账户">账户</el-radio-button>
              <el-radio-button value="系统">系统</el-radio-button>
            </el-radio-group>
            <el-button @click="store.markMessagesRead(messages.map((msg) => msg.id))">批量已读</el-button>
          </div>
          <div v-for="msg in pagedMessages" :key="msg.id" class="message" @click="openMessage(msg.id)">
            <strong>{{ msg.title }}</strong>
            <time>{{ msg.createdAt }}</time>
            <p>{{ msg.content }}</p>
            <el-button size="small" type="danger" @click.stop="store.removeMessage(msg.id)">删除</el-button>
          </div>
          <el-empty v-if="!messages.length" description="暂无消息" />
          <el-pagination v-model:current-page="messagePage" :page-size="5" layout="prev, pager, next, total" :total="messages.length" />
        </template>
      </main>
    </section>
    <el-dialog v-model="messageVisible" title="消息详情" width="560px">
      <h3>{{ currentMessage?.title }}</h3>
      <p>{{ currentMessage?.content }}</p>
      <p class="muted">{{ currentMessage?.createdAt }} · {{ currentMessage?.category }}</p>
    </el-dialog>
  </PublicLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
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
const nextPhone = ref("");
const nextEmail = ref("");
const nextPassword = ref("");
const messageCategory = ref("");
const messagePage = ref(1);
const currentMessageId = ref("");
const messageVisible = ref(false);

onMounted(() => {
  if (!auth.currentUser || auth.role !== "bidder") auth.login("bidder");
  nextPhone.value = auth.currentUser?.phone || "";
  nextEmail.value = auth.currentUser?.email || "";
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

const messages = computed(() => store.db.messages.filter((msg) => msg.userId === auth.currentUser?.id && (!messageCategory.value || msg.category === messageCategory.value)));
const pagedMessages = computed(() => messages.value.slice((messagePage.value - 1) * 5, messagePage.value * 5));
const currentMessage = computed(() => store.db.messages.find((msg) => msg.id === currentMessageId.value));

function nextSafe() {
  if (captcha.value !== "1235" || sms.value !== "8888") {
    ElMessage.warning("请输入演示验证码：图形 1235，短信 8888");
    return;
  }
  if (safeStep.value < 2) safeStep.value += 1;
  if (safeStep.value === 2) auth.verifyCurrentUser();
}

function saveSecurity() {
  if (!auth.currentUser) return;
  const patch = {
    phone: nextPhone.value || auth.currentUser?.phone || "",
    email: nextEmail.value || auth.currentUser?.email
  };
  auth.updateCurrentUser(patch, "账户安全绑定");
  if (nextPassword.value) auth.changePassword(nextPassword.value);
  store.addMessage(auth.currentUser.id, "账户安全更新", "账户安全信息已模拟保存。", "账户");
}

function openMessage(id: string) {
  currentMessageId.value = id;
  store.markMessageRead(id);
  messageVisible.value = true;
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
