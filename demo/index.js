import { UnderlineAction, render } from '../src/index.js';

export function getKeyByRange(range) {
  return `${range.start}-${range.end}`;
}
function needFilterNode(node) {
  if (
    node.classList &&
    (node.nodeName == 'IFRAME' ||
      node.classList.contains('video_iframe') ||
      node.classList.contains('js_img_placeholder') ||
      node.classList.contains('js_wechannel_video_card') ||
      node.classList.contains('js_wechannel_img_card') ||
      node.classList.contains('js_wechannel_live_card') ||
      node.classList.contains('js_wechannel_topic_card') ||
      node.classList.contains('js_audio_frame') ||
      node.classList.contains('js_wap_qqmusic') ||
      node.classList.contains('js_wap_redpacketcover') ||
      node.classList.contains('minishop_card') ||
      node.classList.contains('ct_geography_loc_card') ||
      node.classList.contains('js_weapp_display_element') ||
      node.classList.contains('underline__tag'))
  ) {
    // 所有我们自己定义的含有text节点的组件都要过滤掉
    return NodeFilter.FILTER_REJECT;
  }

  return NodeFilter.FILTER_ACCEPT;
}

let underlineAction = UnderlineAction({
  selector: '.js_underline_content',
  getKeyByRange,
  needFilterNode,
  getAttachNode(node) {
    if (node.tagName === 'SUP') {
      // return true;
    } else if (node.tagName === 'IMG') {
      return true;
    }
  },
  getRenderInfo(node) {
    if (node.tagName === 'IMG') {
      return { src: node.src };
    }
    return {};
  },
});

console.log(underlineAction.getTextByStartEnd(0, 3));
console.log(underlineAction.getTextByStartEnd(2, 3));
const key = underlineAction.mockUnderline(100, 150, {
  innerClass: 'underline',
});
// const spans = underlineAction.mockUnderline(
//   0,
//   5,
//   {
//     className: 'underline',
//   },
//   document.body
// );
const spans = underlineAction.insertSpanInRange(
  0,
  3,
  {
    className: 'underline',
  },
  true
);
// spans.forEach(s=>{
//   underlineAction.mergeTextNode(s)
// })
underlineAction.insertSpanInRange(280, 300, {
  className: 'underline',
});
// underlineAction.removeSpanByKey(key)
// underlineAction.removeSpanByKey('1-6')
// console.log(
//   underlineAction.insertSpanInRange(
//     100,
//     150,
//     {
//       className: 'underline',
//     },
//     true,
//   ),
// );
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
const prerenderInfos = underlineAction
  .getRenderInfoByStartEnd(0, 10)
  .map(v => ({ ...v, style: 'color:red; white-space:pre-wrap;' }));

const nextrenderInfos = underlineAction
  .getRenderInfoByStartEnd(10, 20)
  .map(v => ({ ...v, style: 'color:blue;white-space:pre-wrap;' }));
// const renderInfos = [...prerenderInfos, ...nextrenderInfos];
const renderInfos = underlineAction.getRenderInfoByStartEnd(100, 150);
console.log(renderInfos);
render(renderInfos, renderdom, renderOptions);
render(nextrenderInfos, renderdom, renderOptions);

// underlineAction.insertSpanInRange(
//   0,
//   3,
//   {
//     className: 'underline',
//   },
// );
// underlineAction.insertSpanInRange(
//   110,
//   135,
//   {
//     className: 'underline',
//   },
//   true,

// underlineAction.insertSpanInRange(
//   110,
//   135,
//   {
//     className: 'underline',
//   },
//   document.body,
// );
// underlineAction.mockUnderline(40, 50, {}, document.body);
// underlineAction.mockUnderline(402, 550, {}, document.body);
// underlineAction.mockUnderline(403, 550, {}, document.body);
