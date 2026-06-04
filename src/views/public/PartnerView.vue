<template>
  <PublicLayout>
    <section class="page-shell partner-page">
      <h1>合作企业</h1>
      <div class="partner-grid">
        <div v-for="org in store.enabledPartnerProfiles" :key="org.id" class="partner-card surface">
          <AppLogo compact />
          <h2>{{ org.name }}</h2>
          <p>{{ org.summary }}</p>
          <p>{{ org.phone }}</p>
          <p>{{ org.address }}</p>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<script setup lang="ts">
import PublicLayout from "@/layouts/PublicLayout.vue";
import AppLogo from "@/components/AppLogo.vue";
import { useAuctionStore } from "@/stores/auction";

const store = useAuctionStore();
</script>

<style scoped>
.partner-page {
  padding: 28px 0;
}

.partner-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.partner-card {
  padding: 26px;
  text-align: center;
}
</style>
