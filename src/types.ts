export type Role = "guest" | "bidder" | "merchant" | "platform";

export type ThemeId = "zhongchu" | "gov-blue" | "mine-green" | "orange" | "neutral";

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: Role;
  phone: string;
  email?: string;
  organization?: string;
  department?: string;
  verified: boolean;
  status: "正常" | "待审核" | "冻结";
  lastLogin?: string;
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
}

export interface Meeting {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "即将开始" | "进行中" | "已结束";
  publishStatus: "待发布" | "发布中" | "已发布" | "已撤回";
  startAt: string;
  endAt: string;
  announcementTitle: string;
  enterprise: string;
  assetIds: string[];
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
  type: "类别" | "广告位" | "帮助分类";
  sort: number;
}

export interface ResourceItem {
  id: string;
  categoryId: string;
  title: string;
  url: string;
  status: "启用" | "停用";
  sort: number;
}

export interface UserMessage {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
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
}
