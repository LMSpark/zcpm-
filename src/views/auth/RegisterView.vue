<template>
  <PublicLayout>
    <section class="register-page page-shell">
      <h1>用户注册</h1>
      <el-card>
        <el-radio-group v-model="type">
          <el-radio-button value="个人注册">个人注册</el-radio-button>
          <el-radio-button value="商户注册">商户注册</el-radio-button>
        </el-radio-group>
        <el-steps :active="active" align-center class="steps">
          <el-step title="通过邮箱注册" />
          <el-step title="填写账号信息" />
          <el-step title="注册成功" />
        </el-steps>
        <el-form label-width="110px" class="form">
          <el-form-item label="电子邮箱"><el-input v-model="email" /></el-form-item>
          <el-form-item label="协议确认">
            <el-checkbox v-model="agree">我已阅读并同意平台服务协议、竞买须知、隐私政策</el-checkbox>
          </el-form-item>
          <el-form-item v-if="active >= 1" label="账号名称"><el-input v-model="username" /></el-form-item>
          <el-form-item v-if="active >= 1" label="手机号"><el-input v-model="phone" /></el-form-item>
          <el-form-item>
            <el-button type="primary" @click="next">{{ active < 2 ? "下一步" : "返回登录" }}</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { useAuctionStore } from "@/stores/auction";

const router = useRouter();
const store = useAuctionStore();
const type = ref("个人注册");
const active = ref(0);
const email = ref("250301476@qq.com");
const username = ref("newuser");
const phone = ref("17771476129");
const agree = ref(true);
const created = ref(false);

function next() {
  if (!email.value || !agree.value) {
    ElMessage.warning("请填写邮箱并确认协议");
    return;
  }
  if (active.value === 0) {
    active.value = 1;
    return;
  }
  if (active.value === 1 && !created.value) {
    if (!username.value || !phone.value) {
      ElMessage.warning("请填写账号名称和手机号");
      return;
    }
    if (type.value === "个人注册") {
      store.saveUser({
        id: "",
        username: username.value,
        password: "123456",
        name: username.value,
        role: "bidder",
        phone: phone.value,
        email: email.value,
        verified: false,
        status: "待审核",
        reviewReason: "个人注册待平台审核"
      });
      ElMessage.success("个人注册已提交，请等待平台用户审核");
    } else {
      store.saveEnterpriseApplication({
        id: "",
        enterpriseName: username.value,
        applicant: username.value,
        phone: phone.value,
        email: email.value,
        assetType: "工业循环物资",
        province: "湖北省",
        city: "武汉市",
        address: "请在入驻审核前补充详细地址",
        status: "待审核",
        submittedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        remark: "商户注册自动生成入驻申请"
      });
      ElMessage.success("商户注册已生成入驻申请，请等待平台审核");
    }
    created.value = true;
    active.value = 2;
    return;
  }
  router.push(type.value === "商户注册" ? "/merchant/login" : "/login");
}
</script>

<style scoped>
.register-page {
  padding: 34px 0 80px;
}

.steps {
  margin: 34px 0;
}

.form {
  width: min(620px, 100%);
  margin: 0 auto;
}
</style>
