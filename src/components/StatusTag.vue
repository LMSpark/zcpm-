<template>
  <el-tag :type="type" effect="light" round>{{ value }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ value: string }>();

const type = computed(() => {
  if (["已发布", "已审核", "已通过", "进行中", "已缴纳", "已转成交款", "正常"].includes(props.value)) return "success";
  if (["待审核", "待提交", "待发布", "即将开始", "未缴纳", "发布中"].includes(props.value)) return "warning";
  if (["已驳回", "已终止", "已下架", "已撤回", "已撤拍", "冻结"].includes(props.value)) return "danger";
  if (["已成交"].includes(props.value)) return "primary";
  return "info";
});
</script>
