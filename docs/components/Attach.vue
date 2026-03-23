<template>
  <div v-for="i in 3" :key="i" :ref="(el) => (containers[i - 1] = el)"
    class="rich_media_content js_underline_content autoTypeSetting24psection fix_apple_default_style"
    style="visibility: visible"
    >关于<sup><span>1234578</span>1234</sup>美国银行业。老<img
      class="wx_img"
      src="https://res.wx.qq.com/t/wx_fed/we-emoji/res/v1.3.10/assets/Expression/Expression_42@2x.png"
      alt=""
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { UnderlineAction } from '../../src/index.js';

const containers = ref([]);

function getAttachNode(node) {
  if ('tagName' in node) {
    if (node.tagName === 'SUP' || node.tagName === 'IMG') {
      return true;
    }
  }
  return false;
}

function createAction(el) {
  return UnderlineAction({ selector: el, getAttachNode });
}

onMounted(() => {
  const [el1, el2, el3] = containers.value;

  // 用例1：划"关于"，范围覆盖到 <sup> 位置，<sup> 应被带入划线
  const action1 = createAction(el1);
  action1.insertSpanInRange(0, 2, { className: 'underline' }, true);

  // 用例2：划"老"，范围覆盖到 <img> 位置，<img> 应被带入划线
  const action2 = createAction(el2);
  action2.insertSpanInRange(5, 6, { className: 'underline' }, true);

  // 用例3：只划"关"，范围未覆盖到 <sup> 位置，<sup> 也应被带入划线
  const action3 = createAction(el3);
  action3.insertSpanInRange(0, 1, { className: 'underline' }, true);
});
</script>
