<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useThemeStore } from "@/stores/theme";

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.applyTheme();
});

watch(
  () => themeStore.currentThemeId,
  () => themeStore.applyTheme()
);
</script>
