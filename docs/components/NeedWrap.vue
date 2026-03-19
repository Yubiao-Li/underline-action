<template>
  <div>
    <h4>用例1：flex(row) 内嵌 block 子节点</h4>
    <p>期望：flex(row) 是最近公共父节点，视觉同行，<b>无换行</b></p>
    <div ref="case1" style="display: flex; flex-direction: row;">
      <div>
        <p style="display: block;">flex内blockA</p>
      </div>
      <div>
        <p style="display: block;">flex内blockB</p>
      </div>
    </div>
    <pre>{{ result1 }}</pre>

    <h4>用例2：TR 内嵌 block 子节点</h4>
    <p>期望：TR 是最近公共父节点，视觉同行，<b>无换行</b></p>
    <table ref="case2">
      <tbody>
        <tr>
          <td>
            <p style="display: block;">TR内blockA</p>
          </td>
          <td>
            <p style="display: block;">TR内blockB</p>
          </td>
        </tr>
      </tbody>
    </table>
    <pre>{{ result2 }}</pre>

    <h4>用例3：同一 block 下两个 inline 节点</h4>
    <p>期望：同一 block 内的 inline 节点之间<b>无换行</b></p>
    <div ref="case3">
      <p style="display: block;">
        <span>inlineA</span>
        <span>inlineB</span>
      </p>
    </div>
    <pre>{{ result3 }}</pre>

    <h4>用例4：flex(row) 作为最近公共父节点</h4>
    <p>期望：flex(row) 的直接子节点之间<b>无换行</b></p>
    <div ref="case4" style="display: flex; flex-direction: row;">
      <span>flexChildA</span>
      <span>flexChildB</span>
    </div>
    <pre>{{ result4 }}</pre>

    <h4>用例5：TR 作为最近公共父节点</h4>
    <p>期望：同一 TR 内直接 td 文本之间<b>无换行</b></p>
    <table ref="case5">
      <tbody>
        <tr>
          <td>cellA</td>
          <td>cellB</td>
        </tr>
      </tbody>
    </table>
    <pre>{{ result5 }}</pre>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { UnderlineAction } from '../../src/index.js';

const case1 = ref();
const case2 = ref();
const case3 = ref();
const case4 = ref();
const case5 = ref();

const result1 = ref('');
const result2 = ref('');
const result3 = ref('');
const result4 = ref('');
const result5 = ref('');

onMounted(() => {
  const a1 = UnderlineAction({ selector: case1.value });
  result1.value = a1.getTextByStartEnd(0, a1.getTotalCount());

  const a2 = UnderlineAction({ selector: case2.value });
  result2.value = a2.getTextByStartEnd(0, a2.getTotalCount());

  const a3 = UnderlineAction({ selector: case3.value });
  result3.value = a3.getTextByStartEnd(0, a3.getTotalCount());

  const a4 = UnderlineAction({ selector: case4.value });
  result4.value = a4.getTextByStartEnd(0, a4.getTotalCount());

  const a5 = UnderlineAction({ selector: case5.value });
  result5.value = a5.getTextByStartEnd(0, a5.getTotalCount());
});
</script>
