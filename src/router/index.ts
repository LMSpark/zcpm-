import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const publicRoutes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: () => import("@/views/public/HomeView.vue") },
  { path: "/announcements", name: "announcements", component: () => import("@/views/public/NoticeListView.vue"), meta: { type: "公告", title: "公告" } },
  { path: "/notices/:id", name: "notice-detail", component: () => import("@/views/public/NoticeDetailView.vue") },
  { path: "/bidding", name: "bidding", component: () => import("@/views/public/AssetListView.vue"), meta: { method: "竞价", title: "竞价标的" } },
  { path: "/listings", name: "listings", component: () => import("@/views/public/AssetListView.vue"), meta: { method: "挂牌", title: "挂牌标的" } },
  { path: "/assets/:id", name: "asset-detail", component: () => import("@/views/public/AssetDetailView.vue") },
  { path: "/hall", name: "hall", component: () => import("@/views/public/MeetingHallView.vue") },
  { path: "/hall/:id", name: "hall-detail", component: () => import("@/views/public/MeetingDetailView.vue") },
  { path: "/results", name: "results", component: () => import("@/views/public/NoticeListView.vue"), meta: { type: "信息公示", title: "结果公示" } },
  { path: "/enterprise", name: "enterprise", component: () => import("@/views/public/EnterpriseEntryView.vue") },
  { path: "/partners", name: "partners", component: () => import("@/views/public/PartnerView.vue") },
  { path: "/help", name: "help", component: () => import("@/views/public/NoticeListView.vue"), meta: { type: "帮助", title: "帮助中心" } },
  { path: "/news", name: "news", component: () => import("@/views/public/NoticeListView.vue"), meta: { type: "新闻", title: "新闻中心" } },
  { path: "/login", name: "login", component: () => import("@/views/auth/LoginView.vue") },
  { path: "/register", name: "register", component: () => import("@/views/auth/RegisterView.vue") },
  { path: "/account", name: "account", component: () => import("@/views/account/AccountCenterView.vue") }
];

const merchantRoutes: RouteRecordRaw[] = [
  { path: "/merchant", redirect: "/merchant/bidders" },
  { path: "/merchant/login", name: "merchant-login", component: () => import("@/views/auth/LoginView.vue"), meta: { role: "merchant" } },
  { path: "/merchant/bidders", component: () => import("@/views/admin/BidderManageView.vue"), meta: { scope: "merchant", title: "竞买人管理" } },
  { path: "/merchant/announcements", component: () => import("@/views/admin/NoticeManageView.vue"), meta: { scope: "merchant", noticeType: "交易公告", title: "交易公告管理" } },
  { path: "/merchant/meetings", component: () => import("@/views/admin/MeetingManageView.vue"), meta: { scope: "merchant", title: "交易会管理" } },
  { path: "/merchant/assets", component: () => import("@/views/admin/AssetManageView.vue"), meta: { scope: "merchant", method: "竞价", title: "标的管理" } },
  { path: "/merchant/materials", component: () => import("@/views/admin/MaterialManageView.vue"), meta: { scope: "merchant", title: "标的数量证明材料管理" } },
  { path: "/merchant/publicity", component: () => import("@/views/admin/NoticeManageView.vue"), meta: { scope: "merchant", noticeType: "信息公示", title: "信息公示管理" } },
  { path: "/merchant/company", component: () => import("@/views/admin/CompanyInfoView.vue"), meta: { scope: "merchant", title: "企业信息维护" } }
];

const platformRoutes: RouteRecordRaw[] = [
  { path: "/platform", redirect: "/platform/organizations" },
  { path: "/platform/login", name: "platform-login", component: () => import("@/views/auth/LoginView.vue"), meta: { role: "platform" } },
  { path: "/platform/entry", component: () => import("@/views/admin/EnterpriseApplicationView.vue"), meta: { scope: "platform", title: "入驻申请" } },
  { path: "/platform/online-users", component: () => import("@/views/admin/UserManageView.vue"), meta: { scope: "platform", mode: "online", title: "在线用户" } },
  { path: "/platform/organizations", component: () => import("@/views/admin/OrganizationManageView.vue"), meta: { scope: "platform", title: "机构管理" } },
  { path: "/platform/departments", component: () => import("@/views/admin/DepartmentManageView.vue"), meta: { scope: "platform", title: "部门管理" } },
  { path: "/platform/authorization", component: () => import("@/views/admin/AuthorizationView.vue"), meta: { scope: "platform", title: "分级授权" } },
  { path: "/platform/user-audit", component: () => import("@/views/admin/UserManageView.vue"), meta: { scope: "platform", mode: "audit", title: "用户审核" } },
  { path: "/platform/users", component: () => import("@/views/admin/UserManageView.vue"), meta: { scope: "platform", title: "用户管理" } },
  { path: "/platform/publicity", component: () => import("@/views/admin/NoticeManageView.vue"), meta: { scope: "platform", noticeType: "信息公示", title: "信息公示管理" } },
  { path: "/platform/announcements", component: () => import("@/views/admin/NoticeManageView.vue"), meta: { scope: "platform", noticeType: "交易公告", title: "交易公告管理" } },
  { path: "/platform/meetings", component: () => import("@/views/admin/MeetingManageView.vue"), meta: { scope: "platform", title: "交易会管理" } },
  { path: "/platform/materials", component: () => import("@/views/admin/MaterialManageView.vue"), meta: { scope: "platform", title: "标的数量证明材料管理" } },
  { path: "/platform/assets", component: () => import("@/views/admin/AssetManageView.vue"), meta: { scope: "platform", method: "竞价", title: "标的管理" } },
  { path: "/platform/listing-publicity", component: () => import("@/views/admin/NoticeManageView.vue"), meta: { scope: "platform", noticeType: "挂牌信息公示", title: "挂牌信息公示" } },
  { path: "/platform/listing-announcements", component: () => import("@/views/admin/NoticeManageView.vue"), meta: { scope: "platform", noticeType: "挂牌公告", title: "挂牌公告" } },
  { path: "/platform/listing-bidders", component: () => import("@/views/admin/BidderManageView.vue"), meta: { scope: "platform", method: "挂牌", title: "挂牌报名人审核" } },
  { path: "/platform/listings", component: () => import("@/views/admin/AssetManageView.vue"), meta: { scope: "platform", method: "挂牌", title: "挂牌标的" } },
  { path: "/platform/account-users", component: () => import("@/views/admin/UserManageView.vue"), meta: { scope: "platform", title: "账号用户管理" } },
  { path: "/platform/news", component: () => import("@/views/admin/NoticeManageView.vue"), meta: { scope: "platform", noticeType: "新闻", title: "新闻中心" } },
  { path: "/platform/resources", component: () => import("@/views/admin/ResourceManageView.vue"), meta: { scope: "platform", title: "静态资源配置" } }
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...publicRoutes, ...merchantRoutes, ...platformRoutes, { path: "/:pathMatch(.*)*", redirect: "/" }],
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
