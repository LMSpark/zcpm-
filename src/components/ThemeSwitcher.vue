<template>
  <el-dropdown trigger="click" @command="themeStore.setTheme">
    <el-button plain>
      <Palette :size="16" />
      {{ themeStore.currentTheme.name }}
      <el-icon><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="theme in themeOptions" :key="theme.id" :command="theme.id">
          <span class="theme-item">
            <span class="swatch" :style="{ background: theme.color }" />
            {{ theme.name }}
          </span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ArrowDown } from "@element-plus/icons-vue";
import { Palette } from "lucide-vue-next";
import { useThemeStore, themeOptions } from "@/stores/theme";

const themeStore = useThemeStore();
</script>

<style scoped>
.theme-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
