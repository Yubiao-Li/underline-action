import { UnderlineAction } from '../dist/lib/underlineAction.js';

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
    if (node.parentElement.tagName === 'SUP') {
      return true;
    }
  },
});

// const spans = underlineAction.mockUnderline(
//   0,
//   5,
//   {
//     className: 'underline',
//   },
//   document.body
// );
console.log(
  underlineAction.insertSpanInRange(
    0,
    4,
    {
      className: 'underline',
    },
    true,
  ),
);
const prerenderInfos = underlineAction.getRenderInfoByStartEnd(0, 10).map(v => ({ ...v, color: 'red' }));
const nextrenderInfos = underlineAction.getRenderInfoByStartEnd(10, 20).map(v => ({ ...v, color: 'blue' }));
const renderInfos = [...prerenderInfos, ...nextrenderInfos];
console.log(renderInfos);
let html = '';
let inTable = false;
let table;
renderInfos.forEach((r, index) => {
  switch (r.type) {
    case 'text':
      html += r.textContent;
      break;
    case 'newline':
      if (inTable) {
        inTable = false;
        html += table.outerHTML;
        table = null;
      }
      html += '\n';
      break;
    case 'td':
      if (!inTable) {
        inTable = true;
        table = document.createElement('table');
        for (let i = 0; i < r.totalRow; i++) {
          const tr = document.createElement('tr');
          for (let j = 0; j < r.totalCol; j++) {
            const td = document.createElement('td');
            td.style.whiteSpace = 'pre-wrap';
            tr.appendChild(td);
          }
          table.appendChild(tr);
        }
      }
      const target = table.getElementsByTagName('tr')[r.tableRow].getElementsByTagName('td')[r.tableCol];
      target.style.color = r.color;
      target.innerHTML = r.textContent;
      break;
    case 'table-newline':
      break;
  }
  if (index === renderInfos.length - 1 && table) {
    html += table.outerHTML;
  }
});

render.innerHTML = html;

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
// underlineAction.mockUnderline(401, 550, {}, document.body);
// underlineAction.mockUnderline(402, 550, {}, document.body);
// underlineAction.mockUnderline(403, 550, {}, document.body);
