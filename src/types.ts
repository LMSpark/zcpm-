export type Role = "guest" | "bidder" | "merchant" | "platform";

export type ThemeId = "zhongchu" | "gov-blue" | "mine-green" | "orange" | "neutral";

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  phone: string;
  email?: string;
  organization?: string;
  department?: string;
  verified: boolean;
  status: "正常" | "待审核" | "冻结";
  lastLogin?: string;
  reviewReason?: string;
  updatedAt?: string;
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  method: "竞价" | "挂牌";
  auctionForm: "增价拍" | "降价拍" | "动态报价";
  assetType: string;
  category: string;
  subCategory: string;
  region: string;
  address: string;
  commissionType: string;
  seller: string;
  meetingId?: string;
  announcementId?: string;
  status: "即将开始" | "进行中" | "已结束" | "已成交" | "已流拍" | "已撤拍" | "已终止" | "已下架";
  auditStatus: "草稿" | "待提交" | "待审核" | "已审核" | "已驳回";
  publishStatus: "待发布" | "发布中" | "已发布" | "已撤回";
  startAt: string;
  endAt: string;
  startingPrice: number;
  currentPrice: number;
  appraisalPrice: number;
  reservePrice: number;
  increment: number;
  deposit: number;
  quantity: number;
  priorityRight: boolean;
  views: number;
  winner?: string;
  buyerNo?: string;
  imageTone: string;
  importantNotice: string;
  biddingNotice: string;
  description: string;
  terminationReason?: string;
  reviewReason?: string;
  updatedAt?: string;
}

export interface BidRecord {
  id: string;
  assetId: string;
  bidderId: string;
  bidderName: string;
  bidNo: string;
  amount: number;
  createdAt: string;
  priorityRight?: boolean;
}

export interface Registration {
  id: string;
  assetId: string;
  userId: string;
  name: string;
  phone: string;
  idNo: string;
  bidNo: string;
  applyStatus: "待审核" | "已通过" | "已驳回";
  depositStatus: "未缴纳" | "已缴纳" | "已退还" | "已转成交款";
  registeredAt: string;
  remark?: string;
}

export interface Notice {
  id: string;
  title: string;
  code: string;
  type: "公告" | "交易公告" | "信息公示" | "挂牌公告" | "挂牌信息公示" | "新闻" | "帮助";
  content: string;
  status: "待提交" | "待审核" | "已审核" | "已驳回";
  publishStatus: "待发布" | "发布中" | "已发布" | "已撤回" | "已下架";
  createdAt: string;
  submittedAt?: string;
  auditedAt?: string;
  publishedAt?: string;
  mediaPublished: boolean;
  relatedAssetId?: string;
  meetingId?: string;
  rejectReason?: string;
  contentCategory?: string;
  pinned?: boolean;
  sort?: number;
  reviewReason?: string;
  updatedAt?: string;
}

export interface Meeting {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "即将开始" | "进行中" | "已结束" | "已归档";
  publishStatus: "待发布" | "发布中" | "已发布" | "已撤回";
  startAt: string;
  endAt: string;
  announcementTitle: string;
  enterprise: string;
  assetIds: string[];
  rules?: string;
  archiveStatus?: "未归档" | "已归档";
  reviewReason?: string;
  updatedAt?: string;
}

export interface EnterpriseApplication {
  id: string;
  enterpriseName: string;
  applicant: string;
  phone: string;
  email: string;
  assetType: string;
  province: string;
  city: string;
  address: string;
  status: "待审核" | "已通过" | "已驳回";
  submittedAt: string;
  remark?: string;
  reviewReason?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  parentId?: string;
  name: string;
  code: string;
  shortName: string;
  establishedAt: string;
  legalPerson: string;
  phone: string;
  address: string;
}

export interface Department {
  id: string;
  orgId: string;
  name: string;
  code: string;
  manager: string;
  phone: string;
}

export interface ResourceCategory {
  id: string;
  name: string;
  type: "类别" | "广告位" | "帮助分类" | "新闻分类" | "合作企业";
  sort: number;
  enabled?: boolean;
}

export interface ResourceItem {
  id: string;
  categoryId: string;
  title: string;
  url: string;
  status: "启用" | "停用";
  sort: number;
  summary?: string;
  pinned?: boolean;
  resourceType?: "新闻" | "帮助" | "合作企业" | "静态资源";
  logoAttachmentId?: string;
}

export interface UserMessage {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
  category?: "交易" | "审核" | "系统" | "账户";
}

export interface AttachmentMeta {
  id: string;
  ownerType: "asset" | "notice" | "meeting" | "enterpriseApplication" | "organization" | "resource" | "user" | "registration";
  ownerId: string;
  usage: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: "已上传" | "已删除";
}

export interface AuditLog {
  id: string;
  targetType: string;
  targetId: string;
  action: string;
  operator: string;
  result: string;
  reason?: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  username: string;
  role: Role;
  loginAt: string;
  lastActiveAt: string;
  ip: string;
  device: string;
  online: boolean;
}

export type PermissionKey =
  | "交易管理"
  | "挂牌交易"
  | "系统管理"
  | "商户入驻"
  | "账号管理"
  | "系统配置"
  | "前台交易"
  | "个人中心";

export interface RolePermission {
  role: Role;
  name: string;
  permissions: PermissionKey[];
}

export interface PartnerProfile {
  id: string;
  organizationId?: string;
  name: string;
  phone: string;
  address: string;
  summary: string;
  logoAttachmentId?: string;
  enabled: boolean;
  sort: number;
}

export interface MockDb {
  users: UserAccount[];
  assets: Asset[];
  bidRecords: BidRecord[];
  registrations: Registration[];
  notices: Notice[];
  meetings: Meeting[];
  enterpriseApplications: EnterpriseApplication[];
  organizations: Organization[];
  departments: Department[];
  resourceCategories: ResourceCategory[];
  resourceItems: ResourceItem[];
  messages: UserMessage[];
  attachments: AttachmentMeta[];
  auditLogs: AuditLog[];
  sessions: SessionRecord[];
  rolePermissions: RolePermission[];
  partnerProfiles: PartnerProfile[];
}
