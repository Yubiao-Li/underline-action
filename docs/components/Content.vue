<template>
  <div>
    <div
      ref="content"
      class="rich_media_content js_underline_content autoTypeSetting24psection fix_apple_default_style"
      id="js_content"
      style="visibility: visible"
      >关<img
        id="biaoqin"
        class="wx_img"
        src="https://res.wx.qq.com/t/wx_fed/we-emoji/res/v1.3.10/assets/Expression/Expression_42@2x.png"
        alt=""
      />
    </div>
    <p>text: {{ text }}</p>
    <p>renderInfo: {{ renderInfo }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { UnderlineAction } from '../../src/index.js';

const content = ref();
const text = ref('');
const renderInfo = ref('');
onMounted(() => {
  const underlineAction = UnderlineAction({
    selector: content.value,
    getContentNodeInfo(node) {
      if ('tagName' in node) {
        if (node.tagName === 'IMG') {
          return {
            text: '[表情]',
            len: 1,
          };
        }
      }
      return null;
    },
  });

  underlineAction.insertSpanInRange(0, 2)

  text.value = underlineAction.getTextByStartEnd(0, 2);
  renderInfo.value = underlineAction.getRenderInfoByStartEnd(0, 2);
});
</script>
