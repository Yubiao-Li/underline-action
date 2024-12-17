<template>
  <div ref="content">
    <p>打撒打撒打开</p>
    <p>；里卡多我都挖坑</p>
    <table
      ><tbody>
        <tr><td colspan="2">222</td></tr
        ><tr
          ><td>1<br />2</td><td>34</td><td>56</td></tr
        ><tr><td>78</td><td>90</td><td>44</td></tr>
      </tbody></table
    >
  </div>
  <div
    ref="renderDom"
    id="renderDom"
  ></div>
</template>

<script setup>
import { onMounted, ref } from '@vue/runtime-core';
import { UnderlineAction, render } from '../../src/index.js';

const content = ref();
const renderDom = ref();

onMounted(() => {
  const renderOptions = {
    patchProp(el, key, prevValue, nextValue) {
      switch (key) {
        case 'textContent':
        case 'style':
          el[key] = nextValue;
          break;
        case 'type':
          break;
        default:
          el.setAttribute(key, nextValue);
          break;
      }
    },
    remove(el) {
      el.remove();
    },
    createElement(type) {
      return document.createElement(type);
    },
    createText(text) {
      return document.createTextNode(text);
    },
    insert(node, parent, anchor) {
      if (anchor) {
        parent.insertBefore(node, anchor);
      } else {
        parent.appendChild(node);
      }
    },
  };

  const underlineAction = UnderlineAction({
    selector: content.value,
    getRenderInfo(node) {
      if (node.tagName === 'IMG') {
        return { src: node.src };
      }
      return {};
    },
  });

  render(underlineAction.getRenderInfoByStartEnd(10, 20), renderDom.value, renderOptions);
});
</script>
