import { defineStore } from "pinia";
import type { ThemeId } from "@/types";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  color: string;
}

export const themeOptions: ThemeOption[] = [
  { id: "zhongchu", name: "中楚红", color: "#d92f34" },
  { id: "gov-blue", name: "政务蓝", color: "#1f6feb" },
  { id: "mine-green", name: "矿产绿", color: "#0f8f68" },
  { id: "orange", name: "活力橙", color: "#e26b16" },
  { id: "neutral", name: "中性灰", color: "#4b5d73" }
];

const THEME_KEY = "zcpm-theme";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    currentThemeId: (localStorage.getItem(THEME_KEY) as ThemeId) || "zhongchu"
  }),
  getters: {
    currentTheme(state) {
      return themeOptions.find((theme) => theme.id === state.currentThemeId) || themeOptions[0];
    }
  },
  actions: {
    setTheme(id: ThemeId) {
      this.currentThemeId = id;
      localStorage.setItem(THEME_KEY, id);
      this.applyTheme();
    },
    applyTheme() {
      document.documentElement.dataset.theme = this.currentThemeId;
    }
  }
});
