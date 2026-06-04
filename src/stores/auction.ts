import { defineStore } from "pinia";
import { ElMessage } from "element-plus";
import { seedDb } from "@/mock/seed";
import type {
  Asset,
  AttachmentMeta,
  BidRecord,
  Department,
  EnterpriseApplication,
  Meeting,
  MockDb,
  Notice,
  Organization,
  PartnerProfile,
  PermissionKey,
  Registration,
  ResourceCategory,
  ResourceItem,
  Role,
  RolePermission,
  UserAccount,
  UserMessage
} from "@/types";
import { nowText } from "@/utils/format";

const DB_KEY = "zcpm-shared-db";

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function normalizeDb(input: Partial<MockDb>): MockDb {
  const base = seedDb();
  const db = {
    ...base,
    ...input,
    users: input.users || base.users,
    assets: input.assets || base.assets,
    bidRecords: input.bidRecords || base.bidRecords,
    registrations: input.registrations || base.registrations,
    notices: input.notices || base.notices,
    meetings: input.meetings || base.meetings,
    enterpriseApplications: input.enterpriseApplications || base.enterpriseApplications,
    organizations: input.organizations || base.organizations,
    departments: input.departments || base.departments,
    resourceCategories: input.resourceCategories || base.resourceCategories,
    resourceItems: input.resourceItems || base.resourceItems,
    messages: input.messages || base.messages,
    attachments: input.attachments || base.attachments,
    auditLogs: input.auditLogs || base.auditLogs,
    sessions: input.sessions || base.sessions,
    rolePermissions: input.rolePermissions || base.rolePermissions,
    partnerProfiles: input.partnerProfiles || base.partnerProfiles
  } as MockDb;

  db.users = db.users.map((user) => ({
    ...user,
    password: user.password || base.users.find((item) => item.username === user.username)?.password || "123456"
  }));
  db.notices = db.notices.map((notice, index) => ({
    ...notice,
    contentCategory: notice.contentCategory || (notice.type === "帮助" ? "竞买帮助" : notice.type === "新闻" ? "平台动态" : notice.type),
    sort: notice.sort ?? index + 1,
    pinned: Boolean(notice.pinned)
  }));
  db.meetings = db.meetings.map((meeting) => ({
    ...meeting,
    archiveStatus: meeting.archiveStatus || (meeting.status === "已归档" ? "已归档" : "未归档"),
    rules: meeting.rules || "竞买人须完成实名认证、报名审核和保证金缴纳后进入交易。"
  }));
  db.messages = db.messages.map((message) => ({ ...message, category: message.category || "系统" }));
  return db;
}

function loadDb(): MockDb {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = seedDb();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
  try {
    const db = normalizeDb(JSON.parse(raw) as Partial<MockDb>);
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  } catch {
    const db = seedDb();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
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
      return state.db.notices.filter((notice) => notice.publishStatus === "已发布").sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || (a.sort || 0) - (b.sort || 0));
    },
    unreadMessageCount(state) {
      return (userId: string) => state.db.messages.filter((msg) => msg.userId === userId && !msg.read).length;
    },
    enabledPartnerProfiles(state) {
      return state.db.partnerProfiles.filter((partner) => partner.enabled).sort((a, b) => a.sort - b.sort);
    }
  },
  actions: {
    persist() {
      localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    },
    generateId(prefix: string) {
      return nextId(prefix);
    },
    resetDemoData() {
      this.db = seedDb();
      this.persist();
      ElMessage.success("演示数据已重置，前台/商家端/平台端共用同一份数据");
    },
    addAudit(targetType: string, targetId: string, action: string, result = "成功", reason?: string, operator = "系统") {
      this.db.auditLogs.unshift({
        id: nextId("audit"),
        targetType,
        targetId,
        action,
        operator,
        result,
        reason,
        createdAt: nowText()
      });
      this.persist();
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
    findUserByUsername(username: string) {
      return this.db.users.find((user) => user.username === username);
    },
    verifyCredentials(role: Role, username: string, password: string) {
      const user = this.db.users.find((item) => item.username === username && item.role === role);
      if (!user || user.password !== password) return null;
      if (user.status === "冻结") {
        ElMessage.warning("账号已冻结，请联系平台");
        return null;
      }
      if (role !== "bidder" && user.status === "待审核") {
        ElMessage.warning("账号仍在审核中");
        return null;
      }
      return user;
    },
    createSession(user: UserAccount) {
      this.db.sessions.forEach((session) => {
        if (session.userId === user.id) session.online = false;
      });
      const time = nowText();
      this.db.sessions.unshift({
        id: nextId("session"),
        userId: user.id,
        username: user.username,
        role: user.role,
        loginAt: time,
        lastActiveAt: time,
        ip: "127.0.0.1",
        device: "PC 浏览器",
        online: true
      });
      const saved = this.db.users.find((item) => item.id === user.id);
      if (saved) saved.lastLogin = time;
      this.addAudit("user", user.id, "登录", "成功", user.role, user.name);
      this.persist();
    },
    closeSession(userId: string) {
      this.db.sessions.forEach((session) => {
        if (session.userId === userId) session.online = false;
      });
      this.addAudit("user", userId, "退出登录", "成功");
      this.persist();
    },
    forceLogoutSession(sessionId: string) {
      const session = this.db.sessions.find((item) => item.id === sessionId);
      if (!session) return;
      session.online = false;
      this.addAudit("session", sessionId, "强制下线", "成功", session.username);
      this.persist();
      ElMessage.success("已模拟强制下线");
    },
    hasPermission(role: Role, permission: PermissionKey) {
      return Boolean(this.db.rolePermissions.find((item) => item.role === role)?.permissions.includes(permission));
    },
    saveRolePermission(permission: RolePermission) {
      const index = this.db.rolePermissions.findIndex((item) => item.role === permission.role);
      if (index >= 0) this.db.rolePermissions.splice(index, 1, permission);
      else this.db.rolePermissions.push(permission);
      this.addAudit("permission", permission.role, "保存分级授权", "成功", permission.permissions.join(","));
      this.persist();
      ElMessage.success("权限配置已保存并驱动菜单/按钮展示");
    },
    attachmentsFor(ownerType: AttachmentMeta["ownerType"], ownerId: string, usage?: string) {
      return this.db.attachments.filter((item) => item.ownerType === ownerType && item.ownerId === ownerId && item.status !== "已删除" && (!usage || item.usage === usage));
    },
    addAttachments(attachments: AttachmentMeta[]) {
      this.db.attachments.unshift(...attachments);
      attachments.forEach((attachment) => this.addAudit(attachment.ownerType, attachment.ownerId, `上传${attachment.usage}`, "成功", attachment.fileName));
      this.persist();
      ElMessage.success(`已记录 ${attachments.length} 个附件元数据`);
    },
    removeAttachment(id: string) {
      const attachment = this.db.attachments.find((item) => item.id === id);
      if (!attachment) return;
      attachment.status = "已删除";
      this.addAudit(attachment.ownerType, attachment.ownerId, `删除${attachment.usage}`, "成功", attachment.fileName);
      this.persist();
      ElMessage.success("附件已删除");
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
    addMessage(userId: string, title: string, content: string, category: UserMessage["category"] = "系统") {
      this.db.messages.unshift({
        id: nextId("msg"),
        userId,
        title,
        content,
        createdAt: nowText(),
        read: false,
        category
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
    markMessagesRead(ids: string[]) {
      this.db.messages.forEach((msg) => {
        if (ids.includes(msg.id)) msg.read = true;
      });
      this.persist();
      ElMessage.success("已批量标记已读");
    },
    removeMessage(id: string) {
      this.db.messages = this.db.messages.filter((msg) => msg.id !== id);
      this.persist();
      ElMessage.success("消息已删除");
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
        applyStatus: asset.method === "挂牌" ? "待审核" : "已通过",
        depositStatus: "未缴纳",
        registeredAt: nowText()
      };
      this.db.registrations.unshift(registration);
      this.addMessage(user!.id, "报名成功", `${asset.name} 已报名成功，竞买号 ${bidNo}，请按公告缴纳保证金。`, "交易");
      this.addAudit("registration", registration.id, "报名", "成功", asset.name, user!.name);
      this.persist();
      ElMessage.success(`报名成功，竞买号 ${bidNo}`);
      return registration;
    },
    payDeposit(assetId: string, user: UserAccount | null) {
      const asset = this.findAsset(assetId);
      if (!asset || !this.ensureVerified(user)) return false;
      const registration = this.userRegistration(assetId, user!.id) || this.registerForAsset(assetId, user);
      if (!registration) return false;
      if (registration.applyStatus !== "已通过") {
        ElMessage.warning("报名审核通过后方可缴纳保证金");
        return false;
      }
      if (registration.depositStatus === "已缴纳" || registration.depositStatus === "已转成交款") {
        ElMessage.info("保证金已处理，无需重复缴纳");
        return true;
      }
      registration.depositStatus = "已缴纳";
      this.addMessage(user!.id, "保证金缴纳成功", `${asset.name} 保证金 ${asset.deposit} 元已缴纳，可参与交易。`, "交易");
      this.addAudit("registration", registration.id, "缴纳保证金", "成功", asset.name, user!.name);
      this.persist();
      ElMessage.success("保证金缴纳成功");
      return true;
    },
    placeBid(assetId: string, user: UserAccount | null, amount: number) {
      const asset = this.findAsset(assetId);
      if (!asset || !this.ensureVerified(user)) return false;
      if (asset.method !== "竞价") {
        ElMessage.warning("挂牌标的需按挂牌流程办理，不支持直接出价");
        return false;
      }
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
        this.addMessage(user!.id, "竞价延时提醒", `${asset.name} 末段出价触发 5 分钟延时。`, "交易");
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
      this.addAudit("asset", assetId, "出价", "成功", String(amount), user!.name);
      this.persist();
      ElMessage.success("出价成功，多端数据已同步");
      return true;
    },
    confirmListingDeal(assetId: string, user: UserAccount | null) {
      const asset = this.findAsset(assetId);
      if (!asset || !this.ensureVerified(user)) return false;
      const registration = this.userRegistration(assetId, user!.id);
      if (!registration || registration.applyStatus !== "已通过" || registration.depositStatus !== "已缴纳") {
        ElMessage.warning("请先完成挂牌报名审核和保证金缴纳");
        return false;
      }
      asset.status = "已成交";
      asset.winner = registration.name;
      asset.buyerNo = registration.bidNo;
      registration.depositStatus = "已转成交款";
      this.addMessage(user!.id, "挂牌成交确认", `${asset.name} 已模拟成交确认，保证金已转成交款。`, "交易");
      this.addAudit("asset", assetId, "挂牌成交确认", "成功", registration.bidNo, user!.name);
      this.persist();
      ElMessage.success("挂牌成交确认完成");
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
              this.addMessage(reg.userId, "成交确认提醒", `${asset.name} 已成交，保证金已转成交款，请办理交割。`, "交易");
            } else if (reg.depositStatus === "已缴纳") {
              reg.depositStatus = "已退还";
              this.addMessage(reg.userId, "保证金退还", `${asset.name} 未竞得，保证金已模拟退还。`, "交易");
            }
          });
      }
      this.addAudit("asset", assetId, "成交/流拍处理", "成功", asset.status);
      this.persist();
    },
    refundDeposits(assetId: string, reason: string) {
      this.db.registrations
        .filter((reg) => reg.assetId === assetId && reg.depositStatus === "已缴纳")
        .forEach((reg) => {
          reg.depositStatus = "已退还";
          this.addMessage(reg.userId, "保证金退还", reason, "交易");
        });
      this.persist();
    },
    submitNotice(id: string, reason = "提交审核") {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.status = "待审核";
      notice.submittedAt = nowText();
      notice.reviewReason = reason;
      this.addAudit("notice", id, "提交审核", "成功", reason);
      this.persist();
      ElMessage.success("已提交审核");
    },
    auditNotice(id: string, pass: boolean, reason?: string) {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.status = pass ? "已审核" : "已驳回";
      notice.auditedAt = nowText();
      notice.rejectReason = pass ? undefined : reason || "资料需补充";
      notice.reviewReason = reason;
      this.addAudit("notice", id, pass ? "审核通过" : "审核驳回", "成功", reason);
      this.persist();
      ElMessage.success(pass ? "审核通过" : "已驳回");
    },
    publishNotice(id: string, reason = "发布") {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.publishStatus = "已发布";
      notice.publishedAt = nowText();
      const asset = notice.relatedAssetId ? this.findAsset(notice.relatedAssetId) : undefined;
      if (asset) asset.publishStatus = "已发布";
      this.addAudit("notice", id, "发布", "成功", reason);
      this.persist();
      ElMessage.success("已发布，前台同步可见");
    },
    withdrawNotice(id: string, reason = "撤回") {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.publishStatus = "已撤回";
      notice.reviewReason = reason;
      const asset = notice.relatedAssetId ? this.findAsset(notice.relatedAssetId) : undefined;
      if (asset && asset.publishStatus === "已发布") asset.publishStatus = "已撤回";
      this.addAudit("notice", id, "撤回", "成功", reason);
      this.persist();
      ElMessage.success("已撤回，前台同步隐藏");
    },
    offShelfNotice(id: string, reason = "下架") {
      const notice = this.findNotice(id);
      if (!notice) return;
      notice.publishStatus = "已下架";
      notice.reviewReason = reason;
      const asset = notice.relatedAssetId ? this.findAsset(notice.relatedAssetId) : undefined;
      if (asset) asset.status = "已下架";
      this.addAudit("notice", id, "下架", "成功", reason);
      this.persist();
      ElMessage.success("已下架");
    },
    submitAsset(id: string, reason = "提交审核") {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.auditStatus = "待审核";
      asset.reviewReason = reason;
      this.addAudit("asset", id, "提交审核", "成功", reason);
      this.persist();
      ElMessage.success("标的已提交审核");
    },
    auditAsset(id: string, pass: boolean, reason?: string) {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.auditStatus = pass ? "已审核" : "已驳回";
      asset.reviewReason = reason || (pass ? "审核通过" : "资料需补充");
      asset.terminationReason = pass ? undefined : asset.reviewReason;
      this.addAudit("asset", id, pass ? "审核通过" : "审核驳回", "成功", asset.reviewReason);
      this.persist();
      ElMessage.success(pass ? "审核通过" : "已驳回");
    },
    publishAsset(id: string, reason = "发布") {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.publishStatus = "已发布";
      if (asset.status === "已下架" || asset.status === "已撤拍") asset.status = "即将开始";
      this.addAudit("asset", id, "发布", "成功", reason);
      this.persist();
      ElMessage.success("标的已发布，前台/交易大厅同步更新");
    },
    withdrawAsset(id: string, reason = "撤回") {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.publishStatus = "已撤回";
      asset.status = "已撤拍";
      asset.reviewReason = reason;
      this.refundDeposits(id, "标的撤回，保证金已模拟退还。");
      this.addAudit("asset", id, "撤回", "成功", reason);
      this.persist();
      ElMessage.success("标的已撤回");
    },
    terminateAsset(id: string, reason = "终止申请已确认") {
      const asset = this.findAsset(id);
      if (!asset) return;
      asset.status = "已终止";
      asset.terminationReason = reason;
      this.refundDeposits(id, "标的终止，保证金已模拟退还。");
      this.addAudit("asset", id, "终止", "成功", reason);
      this.persist();
      ElMessage.success("标的已终止，保证金状态已同步");
    },
    deleteAsset(id: string, reason = "删除") {
      this.db.assets = this.db.assets.filter((asset) => asset.id !== id);
      this.db.registrations = this.db.registrations.filter((reg) => reg.assetId !== id);
      this.db.bidRecords = this.db.bidRecords.filter((bid) => bid.assetId !== id);
      this.addAudit("asset", id, "删除", "成功", reason);
      this.persist();
      ElMessage.success("标的已删除，多端同步移除");
    },
    saveAsset(asset: Asset) {
      const payload = { ...asset, updatedAt: nowText() };
      const index = this.db.assets.findIndex((item) => item.id === payload.id);
      if (index >= 0) this.db.assets.splice(index, 1, payload);
      else this.db.assets.unshift({ ...payload, id: payload.id || nextId("asset"), code: payload.code || String(460 + this.db.assets.length) });
      this.addAudit("asset", payload.id || "new", "保存标的", "成功", payload.name);
      this.persist();
      ElMessage.success("标的信息已保存");
    },
    saveNotice(notice: Notice) {
      const payload = { ...notice, updatedAt: nowText() };
      const index = this.db.notices.findIndex((item) => item.id === payload.id);
      if (index >= 0) this.db.notices.splice(index, 1, payload);
      else this.db.notices.unshift({ ...payload, id: payload.id || nextId("notice"), code: payload.code || String(180 + this.db.notices.length) });
      this.addAudit("notice", payload.id || "new", "保存内容", "成功", payload.title);
      this.persist();
      ElMessage.success("内容已保存");
    },
    saveMeeting(meeting: Meeting) {
      const payload = { ...meeting, updatedAt: nowText() };
      const index = this.db.meetings.findIndex((item) => item.id === payload.id);
      if (index >= 0) this.db.meetings.splice(index, 1, payload);
      else this.db.meetings.unshift({ ...payload, id: payload.id || nextId("meet"), code: payload.code || String(180 + this.db.meetings.length) });
      this.addAudit("meeting", payload.id || "new", "保存交易会", "成功", payload.name);
      this.persist();
      ElMessage.success("交易会已保存");
    },
    publishMeeting(id: string, reason = "发布交易会") {
      const meeting = this.findMeeting(id);
      if (!meeting) return;
      meeting.publishStatus = "已发布";
      this.addAudit("meeting", id, "发布", "成功", reason);
      this.persist();
      ElMessage.success("交易会已发布");
    },
    withdrawMeeting(id: string, reason = "撤回交易会") {
      const meeting = this.findMeeting(id);
      if (!meeting) return;
      meeting.publishStatus = "已撤回";
      this.addAudit("meeting", id, "撤回", "成功", reason);
      this.persist();
      ElMessage.success("交易会已撤回");
    },
    endMeeting(id: string, reason = "结束交易会") {
      const meeting = this.findMeeting(id);
      if (!meeting) return;
      meeting.status = "已结束";
      this.addAudit("meeting", id, "结束交易会", "成功", reason);
      this.persist();
      ElMessage.success("交易会已结束");
    },
    archiveMeeting(id: string, reason = "归档交易会") {
      const meeting = this.findMeeting(id);
      if (!meeting) return;
      meeting.status = "已归档";
      meeting.archiveStatus = "已归档";
      this.addAudit("meeting", id, "归档交易会", "成功", reason);
      this.persist();
      ElMessage.success("交易会已归档");
    },
    auditRegistration(id: string, pass: boolean, remark?: string) {
      const registration = this.db.registrations.find((reg) => reg.id === id);
      if (!registration) return;
      registration.applyStatus = pass ? "已通过" : "已驳回";
      registration.remark = remark;
      this.addMessage(registration.userId, pass ? "报名审核通过" : "报名审核驳回", remark || "报名审核状态已更新。", "审核");
      this.addAudit("registration", id, pass ? "报名审核通过" : "报名审核驳回", "成功", remark);
      this.persist();
      ElMessage.success(pass ? "报名审核通过" : "报名审核已驳回");
    },
    auditRegistrations(ids: string[], pass: boolean, remark: string) {
      ids.forEach((id) => this.auditRegistration(id, pass, remark));
      ElMessage.success(`已批量${pass ? "通过" : "驳回"} ${ids.length} 条报名`);
    },
    auditEnterpriseApplication(id: string, pass: boolean, remark?: string) {
      const application = this.db.enterpriseApplications.find((item) => item.id === id);
      if (!application) return;
      application.status = pass ? "已通过" : "已驳回";
      application.remark = remark;
      application.reviewReason = remark;
      if (pass && !this.db.organizations.some((org) => org.name === application.enterpriseName)) {
        const orgId = nextId("org");
        this.db.organizations.push({
          id: orgId,
          parentId: "org-root",
          name: application.enterpriseName,
          code: String(30 + this.db.organizations.length),
          shortName: application.enterpriseName.slice(0, 4),
          establishedAt: nowText().slice(0, 10),
          legalPerson: application.applicant,
          phone: application.phone,
          address: application.address
        });
        this.db.partnerProfiles.push({
          id: nextId("partner"),
          organizationId: orgId,
          name: application.enterpriseName,
          phone: application.phone,
          address: application.address,
          summary: `${application.enterpriseName} 已通过平台入驻审核。`,
          enabled: true,
          sort: this.db.partnerProfiles.length + 1
        });
      }
      this.addAudit("enterpriseApplication", id, pass ? "入驻审核通过" : "入驻审核驳回", "成功", remark);
      this.persist();
      ElMessage.success(pass ? "入驻申请已通过，并同步到机构/合作企业" : "入驻申请已驳回");
    },
    saveEnterpriseApplication(application: EnterpriseApplication) {
      const payload = { ...application, updatedAt: nowText() };
      const index = this.db.enterpriseApplications.findIndex((item) => item.id === payload.id);
      if (index >= 0) this.db.enterpriseApplications.splice(index, 1, payload);
      else this.db.enterpriseApplications.unshift({ ...payload, id: payload.id || nextId("app") });
      this.addAudit("enterpriseApplication", payload.id || "new", "保存入驻申请", "成功", payload.enterpriseName);
      this.persist();
      ElMessage.success("入驻申请已保存");
    },
    saveUser(user: UserAccount) {
      const payload = { ...user, password: user.password || "123456", updatedAt: nowText() };
      const index = this.db.users.findIndex((item) => item.id === payload.id);
      if (index >= 0) this.db.users.splice(index, 1, payload);
      else this.db.users.unshift({ ...payload, id: payload.id || nextId("user") });
      this.addAudit("user", payload.id || "new", "保存用户", "成功", payload.username);
      this.persist();
      ElMessage.success("用户信息已保存");
    },
    removeUser(id: string, reason = "删除用户") {
      this.db.users = this.db.users.filter((user) => user.id !== id);
      this.addAudit("user", id, "删除用户", "成功", reason);
      this.persist();
      ElMessage.success("用户已删除");
    },
    saveOrganization(org: Organization) {
      const index = this.db.organizations.findIndex((item) => item.id === org.id);
      if (index >= 0) this.db.organizations.splice(index, 1, org);
      else this.db.organizations.unshift({ ...org, id: org.id || nextId("org") });
      this.addAudit("organization", org.id || "new", "保存机构", "成功", org.name);
      this.persist();
      ElMessage.success("机构已保存");
    },
    removeOrganization(id: string, reason = "删除机构") {
      this.db.organizations = this.db.organizations.filter((org) => org.id !== id);
      this.db.departments = this.db.departments.filter((dept) => dept.orgId !== id);
      this.addAudit("organization", id, "删除机构", "成功", reason);
      this.persist();
      ElMessage.success("机构已删除，关联部门已同步移除");
    },
    saveDepartment(department: Department) {
      const index = this.db.departments.findIndex((item) => item.id === department.id);
      if (index >= 0) this.db.departments.splice(index, 1, department);
      else this.db.departments.unshift({ ...department, id: department.id || nextId("dept") });
      this.addAudit("department", department.id || "new", "保存部门", "成功", department.name);
      this.persist();
      ElMessage.success("部门已保存");
    },
    removeDepartment(id: string, reason = "删除部门") {
      this.db.departments = this.db.departments.filter((dept) => dept.id !== id);
      this.addAudit("department", id, "删除部门", "成功", reason);
      this.persist();
      ElMessage.success("部门已删除");
    },
    saveResourceCategory(category: ResourceCategory) {
      const payload = { ...category, enabled: category.enabled ?? true };
      const index = this.db.resourceCategories.findIndex((item) => item.id === payload.id);
      if (index >= 0) this.db.resourceCategories.splice(index, 1, payload);
      else this.db.resourceCategories.unshift({ ...payload, id: payload.id || nextId("rc") });
      this.addAudit("resourceCategory", payload.id || "new", "保存资源类别", "成功", payload.name);
      this.persist();
      ElMessage.success("类别已保存");
    },
    removeResourceCategory(id: string, reason = "删除资源类别") {
      this.db.resourceCategories = this.db.resourceCategories.filter((category) => category.id !== id);
      this.db.resourceItems = this.db.resourceItems.filter((item) => item.categoryId !== id);
      this.addAudit("resourceCategory", id, "删除资源类别", "成功", reason);
      this.persist();
      ElMessage.success("类别及下方数据已删除");
    },
    saveResourceItem(item: ResourceItem) {
      const index = this.db.resourceItems.findIndex((resource) => resource.id === item.id);
      if (index >= 0) this.db.resourceItems.splice(index, 1, item);
      else this.db.resourceItems.unshift({ ...item, id: item.id || nextId("ri") });
      if (item.resourceType === "合作企业") {
        const partnerIndex = this.db.partnerProfiles.findIndex((partner) => partner.name === item.title);
        const partner = {
          id: partnerIndex >= 0 ? this.db.partnerProfiles[partnerIndex].id : nextId("partner"),
          name: item.title,
          phone: "4009999988",
          address: item.url || "武汉市",
          summary: item.summary || item.title,
          enabled: item.status === "启用",
          sort: item.sort,
          logoAttachmentId: item.logoAttachmentId
        };
        if (partnerIndex >= 0) this.db.partnerProfiles.splice(partnerIndex, 1, partner);
        else this.db.partnerProfiles.push(partner);
      }
      this.addAudit("resourceItem", item.id || "new", "保存资源项", "成功", item.title);
      this.persist();
      ElMessage.success("资源项已保存");
    },
    removeResourceItem(id: string, reason = "删除资源项") {
      this.db.resourceItems = this.db.resourceItems.filter((resource) => resource.id !== id);
      this.addAudit("resourceItem", id, "删除资源项", "成功", reason);
      this.persist();
      ElMessage.success("资源项已删除");
    },
    savePartnerProfile(profile: PartnerProfile) {
      const index = this.db.partnerProfiles.findIndex((item) => item.id === profile.id);
      if (index >= 0) this.db.partnerProfiles.splice(index, 1, profile);
      else this.db.partnerProfiles.unshift({ ...profile, id: profile.id || nextId("partner") });
      this.addAudit("partner", profile.id || "new", "保存合作企业", "成功", profile.name);
      this.persist();
      ElMessage.success("合作企业配置已保存");
    },
    removeNotice(id: string, reason = "删除") {
      this.db.notices = this.db.notices.filter((notice) => notice.id !== id);
      this.addAudit("notice", id, "删除", "成功", reason);
      this.persist();
      ElMessage.success("已删除");
    },
    removeMeeting(id: string, reason = "删除") {
      this.db.meetings = this.db.meetings.filter((meeting) => meeting.id !== id);
      this.addAudit("meeting", id, "删除", "成功", reason);
      this.persist();
      ElMessage.success("已删除");
    }
  }
});
