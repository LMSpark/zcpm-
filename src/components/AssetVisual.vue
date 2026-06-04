<template>
  <div class="asset-visual" :style="{ background: asset.imageTone }">
    <div class="asset-mark">
      <AppLogo compact />
    </div>
    <span v-if="asset.status !== '进行中' && asset.status !== '即将开始'" class="stamp">{{ asset.status }}</span>
    <span v-else class="live">{{ asset.auctionForm }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Asset } from "@/types";
import AppLogo from "@/components/AppLogo.vue";

defineProps<{ asset: Asset }>();
</script>

<style scoped>
.asset-visual {
  position: relative;
  display: grid;
  min-height: 170px;
  place-items: center;
  overflow: hidden;
  border-radius: 6px;
}

.asset-visual::before {
  position: absolute;
  inset: 0;
  content: "";
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.18), transparent 45%),
    radial-gradient(circle at 75% 12%, rgba(255, 255, 255, 0.2), transparent 28%);
}

.asset-mark {
  position: relative;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  transform: scale(1.25);
}

.stamp,
.live {
  position: absolute;
  right: 12px;
  top: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.42);
}

.live {
  background: var(--app-primary);
}
</style>
