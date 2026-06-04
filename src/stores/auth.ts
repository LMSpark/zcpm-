import { defineStore } from "pinia";
import type { Role, UserAccount } from "@/types";
import { seedDb } from "@/mock/seed";

const AUTH_KEY = "zcpm-auth-user";

function defaultUser(role: Role): UserAccount {
  const users = seedDb().users;
  return users.find((user) => user.role === role) || users[0];
}

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
    login(role: Role = "bidder", username?: string) {
      const user = { ...defaultUser(role) };
      if (username) user.username = username;
      user.lastLogin = new Date().toISOString();
      this.currentUser = user;
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    },
    logout() {
      this.currentUser = null;
      localStorage.removeItem(AUTH_KEY);
    },
    verifyCurrentUser() {
      if (!this.currentUser) return;
      this.currentUser.verified = true;
      localStorage.setItem(AUTH_KEY, JSON.stringify(this.currentUser));
    },
    updateCurrentUser(partial: Partial<UserAccount>) {
      if (!this.currentUser) return;
      this.currentUser = { ...this.currentUser, ...partial };
      localStorage.setItem(AUTH_KEY, JSON.stringify(this.currentUser));
    }
  }
});
