import { defineStore } from "pinia";
import { ElMessage } from "element-plus";
import { seedDb } from "@/mock/seed";
import type {
  Asset,
  BidRecord,
  EnterpriseApplication,
  Meeting,
  MockDb,
  Notice,
  Registration,
  ResourceCategory,
  ResourceItem,
  UserAccount,
  UserMessage
} from "@/types";
import { nowText } from "@/utils/format";

const DB_KEY = "zcpm-shared-db";

function loadDb(): MockDb {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = seedDb();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  try {
    return JSON.parse(raw) as MockDb;
  } catch {
    const db = seedDb();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function shouldExtend(endAt: string) {
  const end = new Date(endAt.replace(" ", "T")).getTime();
  const diff = end - Date.now();
  return diff > 0 && diff <= 5 * 60 * 1000;
}

function addMinutes(value: string, minutes: number) {
  const date = new Date(value.replace(" ", "T"));
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const useAuctionStore = defineStore("auction", {
  state: () => ({
    db: loadDb()
  }),
  getters: {
    publishedAssets(state) {
      return state.db.assets.filter((asset) => asset.publishStatus === "已发布" && asset.status !== "已下架");
    },
    biddingAssets(state) {
      return state.db.assets.filter((asset) => asset.method === "竞价");
    },
    listingAssets(state) {
      return state.db.assets.filter((asset) => asset.method === "挂牌");
    },
    publicNotices(state) {
      return state.db.notices.filter((notice) => notice.publishStatus === "已发布");
    },
    unreadMessageCount(state) {
      return (userId: string) => state.db.messages.filter((msg) => msg.userId === userId && !msg.read).length;
    }
  },
  actions: {
    persist() {
      localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    },
    resetDemoData() {
      this.db = seedDb();
      this.persist();
      ElMessage.success("演示数据已重置，前台/商家端/平台端共用同一份数据");
    },
    findAsset(id: string) {
      return this.db.assets.find((asset) => asset.id === id);
    },
    findNotice(id: string) {
      return this.db.notices.find((notice) => notice.id === id);
    },
    findMeeting(id: string) {
      return this.db.meetings.find((meeting) => meeting.id === id);
    },
    registrationsForAsset(assetId: string) {
      return this.db.registrations.filter((registration) => registration.assetId === assetId);
    },
    bidsForAsset(assetId: string) {
      return this.db.bidRecords.filter((bid) => bid.assetId === assetId).sort((a, b) => b.amount - a.amount);
    },
    userRegistration(assetId: string, userId: string) {
      return this.db.registrations.find((registration) => registration.assetId === assetId && registration.userId === userId);
    },
    addMessage(userId: string, title: string, content: string) {
      this.db.messages.unshift({
        id: nextId("msg"),
        userId,
        title,
        content,
        createdAt: nowText(),
        read: false
      });
      this.persist();
    },
    markMessageRead(id: string) {
      const msg = this.db.messages.find((item) => item.id === id);
      if (msg) {
        msg.read = true;
        this.persist();
      }
    },
    ensureVerified(user: UserAccount | null) {
      if (!user) {
        ElMessage.warning("请先登录竞买人账号");
        return false;
      }
      if (!user.verified) {
        ElMessage.warning("请先在账户安全中完成实名认证");
        return false;
      }
      return true;
    },
    registerForAsset(assetId: string, user: UserAccount | null) {
      const asset = this.findAsset(assetId);
      if (!asset || !this.ensureVerified(user)) return null;
      const existed = this.userRegistration(assetId, user!.id);
      if (existed) {
        ElMessage.info("您已报名该标的");
        return existed;
      }
      const bidNo = `W${720 + this.db.registrations.length + 1}`;
      const registration: Registration = {
        id: nextId("reg"),
        assetId,
        userId: user!.id,
        name: user!.name,
        phone: user!.phone,
        idNo: "420117200308091417",
        bidNo,
        applyStatus: "已通过",
        depositStatus: "未缴纳",
        registeredAt: nowText()
      };
      this.db.registrations.unshift(registration);
      this.addMessage(user!.id, "报名成功", `${asset.name} 已报名成功，竞买号 ${bidNo}，请按公告缴纳保证金。`);
      this.persist();
      ElMessage.success(`报名成功，竞买号 ${bidNo}`);
      return registration;
    },
    payDeposit(assetId: string, user: UserAccount | null) {
      const asset = this.findAsset(assetId);
      if (!asset || !this.ensureVerified(user)) return false;
      const registration = this.userRegistration(assetId, user!.id) || this.registerForAsset(assetId, user);
      if (!registration) return false;
      if (registration.depositStatus === "已缴纳" || registration.depositStatus === "已转成交款") {
        ElMessage.info("保证金已处理，无需重复缴纳");
        return true;
      }
      registration.depositStatus = "已缴纳";
      this.addMessage(user!.id, "保证金缴纳成功", `${asset.name} 保证金 ${asset.deposit} 元已缴纳，可参与竞价。`);
      this.persist();
      ElMessage.success("保证金缴纳成功");
      return true;
    },
    placeBid(assetId: string, user: UserAccount | null, amount: number) {
      const asset = this.findAsset(assetId);
      if (!asset || !this.ensureVerified(user)) return false;
      const registration = this.userRegistration(assetId, user!.id);
      if (!registration) {
        ElMessage.warning("请先报名并获取竞买号");
        return false;
      }
      if (registration.depositStatus !== "已缴纳" && registration.depositStatus !== "已转成交款") {
        ElMessage.warning("缴纳保证金后方可出价");
        return false;
      }
      if (asset.status !== "进行中") {
        ElMessage.warning("当前标的未处于竞价中");
        return false;
      }
      const minimum = Math.max(asset.startingPrice, asset.currentPrice + asset.increment);
      if (amount < minimum) {
        ElMessage.warning(`出价不得低于 ${minimum} 元`);
        return false;
      }
      asset.currentPrice = amount;
      if (shouldExtend(asset.endAt)) {
        asset.endAt = addMinutes(asset.endAt, 5);
        this.addMessage(user!.id, "竞价延时提醒", `${asset.name} 末段出价触发 5 分钟延时。`);
      }
      const bid: BidRecord = {
        id: nextId("bid"),
        assetId,
        bidderId: user!.id,
        bidderName: user!.name,
        bidNo: registration.bidNo,
        amount,
        createdAt: nowText(),
        priorityRight: asset.priorityRight
      };
      this.db.bidRecords.unshift(bid);
      this.persist();
      ElMessage.success("出价成功，多端数据已同步");
      return true;
    },
    concludeAsset(assetId: string, winnerUserId?: string) {
      const asset = this.findAsset(assetId);
      if (!asset) return;
      const bids = this.bidsForAsset(assetId);
      if (!bids.length) {
        asset.status = "已流拍";
        this.refundDeposits(assetId, "标的流拍，保证金已模拟退还。");
      } else {
        const winningBid = bids[0];
        asset.status = "已成交";
        asset.winner = winningBid.bidderName;
        asset.buyerNo = winningBid.bidNo;
        asset.currentPrice = winningBid.amount;
        this.db.registrations
          .filter((reg) => reg.assetId === assetId)
          .forEach((reg) => {
            if (reg.userId === (winnerUserId || winningBid.bidderId)) {
              reg.depositStatus = "已转成交款";
              this.addMessage(reg.userId, "成交确认提醒", `${asset.name} 已成交，保证金已转成交款，请办理交割。`);
            } else if (reg.depositStatus === "已缴纳") {
              reg.depositStatus = "已退还";
              this.addMessage(reg.userId, "保证金退还", `${asset.name} 未竞得，保证金已模拟退还。`);
            }
          });
      }
      this.persist();
    },
    refundDeposits(assetId: string, reason: string) {
      this.db.registrations
        .filter((reg) => reg.assetId === assetId && reg.depositStatus === "已缴纳")
        .forEach((reg) => {
          reg.depositStatus = "已退还";
          this.addMessage(reg.userId, "保证金退还", reason);
        });
      this.persist();
    },
    submitNotice(id: string) {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.status = "待审核";
      notice.submittedAt = nowText();
      this.persist();
      ElMessage.success("已提交审核");
    },
    auditNotice(id: string, pass: boolean, reason?: string) {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.status = pass ? "已审核" : "已驳回";
      notice.auditedAt = nowText();
      notice.rejectReason = pass ? undefined : reason || "资料需补充";
      this.persist();
      ElMessage.success(pass ? "审核通过" : "已驳回");
    },
    publishNotice(id: string) {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.publishStatus = "已发布";
      notice.publishedAt = nowText();
      const asset = notice.relatedAssetId ? this.findAsset(notice.relatedAssetId) : undefined;
      if (asset) {
        asset.publishStatus = "已发布";
      }
      this.persist();
      ElMessage.success("已发布，前台同步可见");
    },
    withdrawNotice(id: string) {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.publishStatus = "已撤回";
      const asset = notice.relatedAssetId ? this.findAsset(notice.relatedAssetId) : undefined;
      if (asset && asset.publishStatus === "已发布") asset.publishStatus = "已撤回";
      this.persist();
      ElMessage.success("已撤回，前台同步隐藏");
    },
    offShelfNotice(id: string) {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.publishStatus = "已下架";
      const asset = notice.relatedAssetId ? this.findAsset(notice.relatedAssetId) : undefined;
      if (asset) asset.status = "已下架";
      this.persist();
      ElMessage.success("已下架");
    },
    submitAsset(id: string) {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.auditStatus = "待审核";
      this.persist();
      ElMessage.success("标的已提交审核");
    },
    auditAsset(id: string, pass: boolean, reason?: string) {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.auditStatus = pass ? "已审核" : "已驳回";
      asset.terminationReason = pass ? undefined : reason || "资料需补充";
      this.persist();
      ElMessage.success(pass ? "审核通过" : "已驳回");
    },
    publishAsset(id: string) {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.publishStatus = "已发布";
      if (asset.status === "已下架" || asset.status === "已撤拍") asset.status = "即将开始";
      this.persist();
      ElMessage.success("标的已发布，前台/交易大厅同步更新");
    },
    withdrawAsset(id: string) {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.publishStatus = "已撤回";
      asset.status = "已撤拍";
      this.refundDeposits(id, "标的撤回，保证金已模拟退还。");
      this.persist();
      ElMessage.success("标的已撤回");
    },
    terminateAsset(id: string, reason = "终止申请已确认") {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.status = "已终止";
      asset.terminationReason = reason;
      this.refundDeposits(id, "标的终止，保证金已模拟退还。");
      this.persist();
      ElMessage.success("标的已终止，保证金状态已同步");
    },
    deleteAsset(id: string) {
      this.db.assets = this.db.assets.filter((asset) => asset.id !== id);
      this.db.registrations = this.db.registrations.filter((reg) => reg.assetId !== id);
      this.db.bidRecords = this.db.bidRecords.filter((bid) => bid.assetId !== id);
      this.persist();
      ElMessage.success("标的已删除，多端同步移除");
    },
    saveAsset(asset: Asset) {
      const index = this.db.assets.findIndex((item) => item.id === asset.id);
      if (index >= 0) {
        this.db.assets.splice(index, 1, asset);
      } else {
        this.db.assets.unshift({ ...asset, id: nextId("asset"), code: String(460 + this.db.assets.length) });
      }
      this.persist();
      ElMessage.success("标的信息已保存");
    },
    saveNotice(notice: Notice) {
      const index = this.db.notices.findIndex((item) => item.id === notice.id);
      if (index >= 0) {
        this.db.notices.splice(index, 1, notice);
      } else {
        this.db.notices.unshift({ ...notice, id: nextId("notice"), code: String(180 + this.db.notices.length) });
      }
      this.persist();
      ElMessage.success("内容已保存");
    },
    saveMeeting(meeting: Meeting) {
      const index = this.db.meetings.findIndex((item) => item.id === meeting.id);
      if (index >= 0) this.db.meetings.splice(index, 1, meeting);
      else this.db.meetings.unshift({ ...meeting, id: nextId("meet"), code: String(180 + this.db.meetings.length) });
      this.persist();
      ElMessage.success("交易会已保存");
    },
    auditRegistration(id: string, pass: boolean, remark?: string) {
      const registration = this.db.registrations.find((reg) => reg.id === id);
      if (!registration) return;
      registration.applyStatus = pass ? "已通过" : "已驳回";
      registration.remark = remark;
      this.addMessage(registration.userId, pass ? "报名审核通过" : "报名审核驳回", remark || "报名审核状态已更新。");
      this.persist();
      ElMessage.success(pass ? "报名审核通过" : "报名审核已驳回");
    },
    auditEnterpriseApplication(id: string, pass: boolean, remark?: string) {
      const application = this.db.enterpriseApplications.find((item) => item.id === id);
      if (!application) return;
      application.status = pass ? "已通过" : "已驳回";
      application.remark = remark;
      if (pass && !this.db.organizations.some((org) => org.name === application.enterpriseName)) {
        this.db.organizations.push({
          id: nextId("org"),
          parentId: "org-root",
          name: application.enterpriseName,
          code: String(30 + this.db.organizations.length),
          shortName: application.enterpriseName.slice(0, 4),
          establishedAt: nowText().slice(0, 10),
          legalPerson: application.applicant,
          phone: application.phone,
          address: application.address
        });
      }
      this.persist();
      ElMessage.success(pass ? "入驻申请已通过，并同步到机构管理" : "入驻申请已驳回");
    },
    saveEnterpriseApplication(application: EnterpriseApplication) {
      const index = this.db.enterpriseApplications.findIndex((item) => item.id === application.id);
      if (index >= 0) this.db.enterpriseApplications.splice(index, 1, application);
      else this.db.enterpriseApplications.unshift({ ...application, id: nextId("app") });
      this.persist();
      ElMessage.success("入驻申请已保存");
    },
    saveUser(user: UserAccount) {
      const index = this.db.users.findIndex((item) => item.id === user.id);
      if (index >= 0) this.db.users.splice(index, 1, user);
      else this.db.users.unshift({ ...user, id: nextId("user") });
      this.persist();
      ElMessage.success("用户信息已保存");
    },
    saveResourceCategory(category: ResourceCategory) {
      const index = this.db.resourceCategories.findIndex((item) => item.id === category.id);
      if (index >= 0) this.db.resourceCategories.splice(index, 1, category);
      else this.db.resourceCategories.unshift({ ...category, id: nextId("rc") });
      this.persist();
    },
    saveResourceItem(item: ResourceItem) {
      const index = this.db.resourceItems.findIndex((resource) => resource.id === item.id);
      if (index >= 0) this.db.resourceItems.splice(index, 1, item);
      else this.db.resourceItems.unshift({ ...item, id: nextId("ri") });
      this.persist();
    },
    removeNotice(id: string) {
      this.db.notices = this.db.notices.filter((notice) => notice.id !== id);
      this.persist();
      ElMessage.success("已删除");
    },
    removeMeeting(id: string) {
      this.db.meetings = this.db.meetings.filter((meeting) => meeting.id !== id);
      this.persist();
      ElMessage.success("已删除");
    }
  }
});
