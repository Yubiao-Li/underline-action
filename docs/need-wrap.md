# 换行判断验证

<script setup>
import NeedWrap from './components/NeedWrap.vue'
</script>

::: details
修复了 `needWrap.ts` 中三个函数的逻辑，确保只有当容器是最近公共父节点时才判定换行/同行：
- `findBlock`：block/table-row 容器
- `inSameLine` (flex)：flex 容器
- `inSameLine` (TR)：TR 元素
:::

<NeedWrap />

<style>
  .underline, mp-common-product::part(underline) {
    position: relative;
    background:transparent url("data:image/svg+xml,%3Csvg width='8' height='2' viewBox='0 0 8 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.25 1.5H0.75C0.335786 1.5 0 1.16421 0 0.75C0 0.335786 0.335786 0 0.75 0H3.25C3.66421 0 4 0.335786 4 0.75C4 1.16421 3.66421 1.5 3.25 1.5Z' fill='%2307C160' fill-opacity='0.5'/%3E%3C/svg%3E%0A") repeat-x 0 100%;
    background-size:auto 2px;
    padding-bottom:2px;
  }

  p {
    overflow: hidden;
  }

  #js_content {
    width: 900px;
  }

  tr {
    width: 100%;
    text-align: justify;
  }
  td {
    white-space: pre-wrap;
  }
</style>
