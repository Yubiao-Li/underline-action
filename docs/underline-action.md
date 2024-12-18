# Underline Action playground

<script setup>
import Font from './components/Font.vue'
import Attach from './components/Attach.vue'
import RenderInfo from './components/RenderInfo.vue'
import Mock from './components/Mock.vue'
import Shadow from './components/Shadow.vue'
</script>

## 参差不齐的划线

<Font />

## 附加节点

<Attach />

## 自定义渲染

<RenderInfo />

## Mock underline

<Mock />

## Shadow Dom

::: details
对于某些需要划线的自定义元素，我们可以用在初始化的时候传入白名单来控制是否需要算入字数以及划线
|opt|type|
|-|-|
|shadowNodeWhiteList|string[]|
:::

<Shadow />

<style>
  .underline {
      position: relative;
      /* text-decoration-line: underline;
      text-decoration-style: dashed;
      text-decoration-color: rgba(7, 193, 96, .8);
      text-decoration-thickness: 3px; */
      background:transparent url("data:image/svg+xml,%3Csvg width='8' height='2' viewBox='0 0 8 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.25 1.5H0.75C0.335786 1.5 0 1.16421 0 0.75C0 0.335786 0.335786 0 0.75 0H3.25C3.66421 0 4 0.335786 4 0.75C4 1.16421 3.66421 1.5 3.25 1.5Z' fill='%2307C160' fill-opacity='0.5'/%3E%3C/svg%3E%0A") repeat-x 0 100%;
      background-size:auto 2px;
      padding-bottom:2px;
    }

    p {
      overflow: hidden;
    }

    .attach_container {
      position: relative;
    }

    #js_content {
      width: 900px;
    }

    .attach_node {
      position: absolute;
      bottom: 0;
      right: 0
    }
    tr {
      width: 100%;
      text-align: justify;
    }
    td {
      white-space: pre-wrap;
    }
    .wx_img {
      display: inline;
      width: 20px;
      height: 20px;
    }
</style>
