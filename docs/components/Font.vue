<template>
  <p
    ref="content"
    style="margin: 10px 5px; display: block; line-height: 1.75em"
  >
    <span style="font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
      ><span
        style="font-family: 'Courier New'; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__19"
        >-</span
      ><span
        style="font-family: KaiTi; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__20"
        >根据上清所数据，境外机构</span
      ><span
        style="font-family: 'Courier New'; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__21"
        >3</span
      ><span
        style="font-family: KaiTi; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__22"
        >月增持的同业存单约</span
      ><span
        style="font-family: 'Courier New'; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__23"
        >1187.7</span
      ><span
        style="font-family: KaiTi; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__24"
        >亿元，则为</span
      ><span
        style="font-family: 'Courier New'; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__25"
        >2014</span
      ><span
        style="font-family: KaiTi; font-size: 17px; letter-spacing: 1px; color: rgb(127, 127, 127)"
        class="js_darkmode__text__26"
        >年有数据以来的最大单月增持幅度。</span
      ></span
    >

    <span style="font-family: Arial, Helvetica, sans-serif"
      ><span
        style="font-size: 16px; letter-spacing: 2px"
        class="js_darkmode__text__51"
        ><span class="wx_text_underline">据悉，</span
        ><strong class="js_darkmode__text__52"
          ><span class="wx_text_underline">今年的华附奥班（100强）生源榜首学校应为</span></strong
        ></span
      ><span style="letter-spacing: 2px; font-size: 24px; /* vertical-align: sub; */"
        ><strong class="js_darkmode__text__53"><span class="wx_text_underline">华景小学</span></strong></span
      ><span
        style="font-size: 16px; letter-spacing: 2px"
        class="js_darkmode__text__54"
        ><span class="wx_text_underline">，</span
        ><strong class="js_darkmode__text__55"><span class="wx_text_underline">多达10人</span></strong></span
      ><span
        style="color: rgb(136, 136, 136); letter-spacing: 2px; font-size: 13px"
        class="js_darkmode__text__56"
        ><span class="wx_text_underline">（含1人高年级转学）</span></span
      ><span style="font-size: 16px; letter-spacing: 2px"
        ><strong class="js_darkmode__text__57"><span class="wx_text_underline">上榜</span></strong></span
      ><span
        style="color: rgb(136, 136, 136); letter-spacing: 2px; font-size: 13px"
        class="js_darkmode__text__58"
        ><span class="wx_text_underline">，</span></span
      ><strong
        ><span
          style="font-size: 16px; letter-spacing: 2px"
          class="js_darkmode__text__59"
          ><span class="wx_text_underline">一</span></span
        ></strong
      ><span style="font-size: 16px; letter-spacing: 2px"
        ><strong class="js_darkmode__text__60"><span class="wx_text_underline">校独揽了1/10份额！</span></strong></span
      ></span
    ><
  </p>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { UnderlineAction } from '../../src/index.js';

const content = ref();
onMounted(() => {
  const underlineAction = UnderlineAction({
    selector: content.value,
  });
  underlineAction.insertSpanInRange(
    0,
    40,
    {
      className: 'underline',
    },
    true
  );

  underlineAction.insertSpanInRange(
    60,
    80,
    {
      className: 'underline',
    },
    true
  );
});
</script>
