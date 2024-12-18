<template>
  <div ref="content">
    大家撒开了大家撒了看见打了卡<mp-common-product data-title="哈哈哈哈看到就杀了科技大厦路口见"></mp-common-product>
    <p> 有理打撒的健康撒来得及阿斯利康多久啊我理解 </p>
  </div>
</template>

<script setup>
import { UnderlineAction } from '../../src/index.js';
import { onMounted, ref } from 'vue';

const content = ref();

class AAA extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const span = document.createElement('span');
    span.innerText = this.getAttribute('data-title');
    shadow.appendChild(span);
  }
}

customElements.define('mp-common-product', AAA);
onMounted(() => {
  const underlineAction = UnderlineAction({
    selector: content.value,
    shadowNodeWhiteList: ['MP-COMMON-PRODUCT'],
  });

  underlineAction.insertSpanInRange(0, 20, {
    part: 'underline',
  });
});
</script>
