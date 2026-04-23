<template>
  <div ref="content">
    <svg viewBox="0 0 500 120" width="500" height="120" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="40" font-size="20" fill="#333">这是SVG内的文字用于测试划线功能</text>
      <text x="10" y="80" font-size="16" fill="#666">第二行SVG文字验证多行场景</text>
    </svg>
  </div>
</template>

<script setup>
import { UnderlineAction } from '../../src/index.js';
import { onMounted, ref } from 'vue';

const content = ref();

onMounted(() => {
  const underlineAction = UnderlineAction({
    selector: content.value,
  });

  underlineAction.insertSpanInRange(2, 12, {});
});
</script>
