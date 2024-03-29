# Underline-action

## 这是什么

该库用于选中页面一段富文本并给文本划线，常用于各种划线评论与划线高亮场景

## install

`npm i underline-action`

## How to use

```js
import { UnderlineAction } from 'underline-action';

// 初始化
const action = UnderlineAction({
  selector: '#app', // 需要插入划线的祖先dom
  tag: 'span',  // 插入的标签类型
  getKeyByRange({ start, end, props }) {  // 生成划线id的规则
    return `${start}-${end}`;
  },
  needFilterNode(node) {  // 需要过滤的节点
    if (xxx) {
      return NodeFilter.FILTER_REJECT;
    }

    return NodeFilter.FILTER_ACCEPT;
  },
  getAttachNode(node) { // 不计入总字数的节点，但是如果被跨过会被划线，返回true，目前仅支持文本节点
    if (node.parentElement.tagName === 'SUP') {
      return true;
    }
  },
  getRenderInfo(node) {   // 获取节点的用于渲染的信息，会在render方法的patchProps带上
    return {};
  }
});

// 划线
const key = action.insertSpanInRange(start, end, props, temp)
# start 开始划线的位置
# end 结束划线的位置
# props span上要带的属性
# temp boolean 为true返回生成的span数组，为false会存在实例的state里面，这里如果不需要存储状态建议用true

// 用key删除划线
action.removeSpanByKey(key)
# key 划线id

// 直接用span删除划线
action.mergeTextNode(span)
# span 划线span

// 获取起止之间文本
action.getTextByStartEnd(start, end)
# start 开始的位置
# end 结束的位置

// 获取所有span
const spans = action.getSpanByKey(key)
# key 划线id

// 获取dom总字数
const num = action.getTotalCount()

// 获取用于渲染元信息
const renderInfo = action.getRenderInfoByStartEnd(start, end)

// 使用元信息渲染，参考vue调和器
render(renderInfos, renderdom, {
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
});
```
