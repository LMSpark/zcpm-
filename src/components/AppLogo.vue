<template>
  <div class="app-logo" :class="{ compact }">
    <div class="mark">
      <span>Z</span>
    </div>
    <div v-if="!compact" class="copy">
      <strong>中楚拍卖</strong>
      <small>城市矿产交易平台</small>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ compact?: boolean }>();
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-dark));
  box-shadow: 0 10px 22px color-mix(in srgb, var(--app-primary), transparent 72%);
  font-weight: 800;
}

.copy {
  display: grid;
  gap: 2px;
}

.copy strong {
  font-size: 18px;
  line-height: 1;
}

.copy small {
  color: var(--app-text-soft);
  font-size: 12px;
}

.compact .mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}
</style>
