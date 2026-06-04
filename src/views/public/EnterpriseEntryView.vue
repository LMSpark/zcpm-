<template>
  <PublicLayout>
    <section class="entry-page">
      <div class="entry-card">
        <h1>企业入驻</h1>
        <p>请将以下信息和材料补充完整发送到邮箱 <b>zczxpm@126.com</b> 中进行入驻申请</p>
        <div class="entry-grid">
          <div class="info-box">
            <h2>1. 企业信息</h2>
            <p v-for="item in fields" :key="item">{{ item }}</p>
          </div>
          <div class="material-box">
            <h2>2. 企业材料</h2>
            <div class="certs">
              <div class="cert">营业执照</div>
              <div class="cert">经营批准证书</div>
              <div class="cert logo">企业 logo</div>
            </div>
          </div>
          <div class="tip-box">
            <h2>3. 提示</h2>
            <p>邮件发送成功后，请等待平台工作人员回复邮件，如有疑问可添加平台客服咨询。</p>
            <p>客服在线时间：工作日 08:30-20:30；非工作日 09:00-11:30 13:00-18:00。</p>
          </div>
        </div>
        <el-button type="primary" @click="dialogVisible = true">在线提交入驻申请</el-button>
      </div>
    </section>
    <el-dialog v-model="dialogVisible" title="企业入驻申请" width="720px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="企业名称"><el-input v-model="form.enterpriseName" /></el-form-item>
        <el-form-item label="申请人"><el-input v-model="form.applicant" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="标的类型"><el-select v-model="form.assetType"><el-option label="工业循环物资" value="工业循环物资" /><el-option label="房产" value="房产" /></el-select></el-form-item>
        <el-form-item label="地址"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="营业执照"><el-upload action="#" :auto-upload="false" :on-change="addBusinessLicense"><el-button type="primary">上传营业执照</el-button></el-upload></el-form-item>
        <el-form-item label="经营批准证书"><el-upload action="#" :auto-upload="false" :on-change="addPermit"><el-button type="primary">上传批准证书</el-button></el-upload></el-form-item>
        <el-form-item label="企业logo"><el-upload action="#" :auto-upload="false" :on-change="addLogo"><el-button type="primary">上传logo</el-button></el-upload></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </PublicLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessageBox, type UploadFile } from "element-plus";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { useAuctionStore } from "@/stores/auction";
import { mockUpload } from "@/utils/workflow";

const store = useAuctionStore();
const dialogVisible = ref(false);
const pendingFiles = ref<{ usage: string; file: File }[]>([]);
const fields = ["企业名称", "标的类型", "平台账号绑定手机号", "企业负责人姓名", "企业负责人电话", "法人姓名", "法人手机号", "公司传真", "公司地址", "邮编"];
const form = reactive({
  id: "",
  enterpriseName: "新入驻企业",
  applicant: "申请人",
  phone: "13247164111",
  email: "apply@zcpm.local",
  assetType: "工业循环物资",
  province: "湖北省",
  city: "武汉市",
  address: "武汉市东湖高新区",
  status: "待审核" as const,
  submittedAt: new Date().toISOString().slice(0, 19).replace("T", " ")
});

async function submit() {
  await ElMessageBox.confirm("确认提交企业入驻申请？提交后可在平台端入驻申请中审核。", "提交确认", { type: "warning" });
  const id = form.id || store.generateId("app");
  store.saveEnterpriseApplication({ ...form, id });
  const attachments = pendingFiles.value.flatMap((item) => mockUpload([item.file], "enterpriseApplication", id, item.usage, store.generateId));
  if (attachments.length) store.addAttachments(attachments);
  pendingFiles.value = [];
  dialogVisible.value = false;
}

function addFile(file: UploadFile, usage: string) {
  if (file.raw) pendingFiles.value.push({ usage, file: file.raw });
}

function addBusinessLicense(file: UploadFile) {
  addFile(file, "营业执照");
}

function addPermit(file: UploadFile) {
  addFile(file, "经营批准证书");
}

function addLogo(file: UploadFile) {
  addFile(file, "企业logo");
}
</script>

<style scoped>
.entry-page {
  padding: 30px 0;
  background: linear-gradient(180deg, #f8bb22, #fff4d7);
}

.entry-card {
  width: min(1060px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 32px 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 8px;
}

.entry-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 22px;
  margin: 24px 0;
  text-align: left;
}

.info-box,
.material-box,
.tip-box {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.tip-box {
  grid-column: 2;
}

.certs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.cert {
  display: grid;
  min-height: 120px;
  place-items: center;
  border: 1px solid #d7b38a;
  border-radius: 6px;
  background: #fffaf1;
}
</style>
