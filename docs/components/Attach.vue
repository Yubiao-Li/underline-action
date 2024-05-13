<template>
  <div
    ref="content"
    class="rich_media_content js_underline_content autoTypeSetting24psection fix_apple_default_style"
    id="js_content"
    style="visibility: visible"
    >关于<sup><span>1234578</span>1234</sup> 美国银行业。老<img
      id="biaoqin"
      class="wx_img"
      src="https://res.wx.qq.com/t/wx_fed/we-emoji/res/v1.3.10/assets/Expression/Expression_42@2x.png"
      alt=""
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { UnderlineAction } from '../../src/index.js';

const content = ref();
onMounted(() => {
  const underlineAction = UnderlineAction({
    selector: content.value,
    getAttachNode(node) {
      if ('tagName' in node) {
        if (node.tagName === 'SUP') {
          return true;
        } else if (node.tagName === 'IMG') {
          return true;
        }
      }
      return false;
    },
  });
  const spans = underlineAction.insertSpanInRange(
    0,
    3,
    {
      className: 'underline',
    },
    true
  );
});
</script>
