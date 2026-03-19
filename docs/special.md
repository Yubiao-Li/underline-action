# 特殊场景

<script setup>
import Shadow from './components/Shadow.vue'
import Content from './components/Content.vue'
</script>

## Shadow Dom

::: details
对于某些需要划线的自定义元素，我们可以用在初始化的时候传入白名单来控制是否需要算入字数以及划线
|opt|type|
|-|-|
|shadowNodeWhiteList|string[]|
:::

<Shadow />

## 特殊的正文节点

::: details
对于某些特别的叶子节点，我们可能也希望算入总字数，此时需要告知这个节点的长度和文本
|opt|type|
|-|-|
|getContentNodeInfo|(cur: HTMLElement) => ContentNodeInfo \| null|

|interface|type|
|-|-|
|ContentNodeInfo|{ len: number\; text: string; } \| null|

:::

<Content />

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

  .wx_img {
    display: inline;
    width: 20px;
    height: 20px;
  }
</style>
