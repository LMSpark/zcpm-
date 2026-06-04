import { defineStore } from "pinia";
import { ElMessage } from "element-plus";
import type { Role, UserAccount } from "@/types";
import { useAuctionStore } from "@/stores/auction";

const AUTH_KEY = "zcpm-auth-user";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    currentUser: JSON.parse(localStorage.getItem(AUTH_KEY) || "null") as UserAccount | null
  }),
  getters: {
    role(state): Role {
      return state.currentUser?.role || "guest";
    },
    isLoggedIn(state) {
      return Boolean(state.currentUser);
    }
  },
  actions: {
    login(role: Role = "bidder", username?: string, password?: string) {
      const auctionStore = useAuctionStore();
      const defaultUser = auctionStore.db.users.find((user) => user.role === role);
      const loginName = username || defaultUser?.username || "";
      const loginPassword = password ?? defaultUser?.password ?? "123456";
      const user = auctionStore.verifyCredentials(role, loginName, loginPassword);
      if (!user) {
        ElMessage.error("用户名、密码或角色不匹配");
        return false;
      }
      this.currentUser = { ...user };
      localStorage.setItem(AUTH_KEY, JSON.stringify(this.currentUser));
      auctionStore.createSession(user);
      ElMessage.success("登录成功");
      return true;
    },
    logout() {
      const auctionStore = useAuctionStore();
      if (this.currentUser) auctionStore.closeSession(this.currentUser.id);
      this.currentUser = null;
      localStorage.removeItem(AUTH_KEY);
    },
    verifyCurrentUser(reason = "实名认证模拟通过") {
      if (!this.currentUser) return;
      const auctionStore = useAuctionStore();
      this.currentUser.verified = true;
      this.currentUser.status = this.currentUser.status === "待审核" ? "正常" : this.currentUser.status;
      auctionStore.saveUser(this.currentUser);
      auctionStore.addAudit("user", this.currentUser.id, "实名认证", "成功", reason, this.currentUser.name);
      localStorage.setItem(AUTH_KEY, JSON.stringify(this.currentUser));
    },
    updateCurrentUser(partial: Partial<UserAccount>, reason = "账户信息维护") {
      if (!this.currentUser) return;
      const auctionStore = useAuctionStore();
      this.currentUser = { ...this.currentUser, ...partial };
      auctionStore.saveUser(this.currentUser);
      auctionStore.addAudit("user", this.currentUser.id, reason, "成功", undefined, this.currentUser.name);
      localStorage.setItem(AUTH_KEY, JSON.stringify(this.currentUser));
    },
    changePassword(nextPassword: string) {
      if (!this.currentUser) return;
      this.updateCurrentUser({ password: nextPassword }, "修改密码");
      ElMessage.success("密码已更新，下次登录生效");
    }
  }
});
