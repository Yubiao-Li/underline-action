import { h } from "@vue/runtime-core";
import { RendererOptions, createRenderer } from "./reconciler";
import { RenderInfo } from "./type";

function getRenderVNode(renderInfos: RenderInfo[]) {
  const results: Array<any> = [];
  let inTable = false;
  let lastRow = -1;
  let lastCol = -1;
  renderInfos.forEach(element => {
    switch (element.type) {
      case 'text':
        results.push(h('span',element));
        break;
      case 'newline':
        if (inTable) {
          inTable = false;
          lastRow = -1;
          lastCol = -1;
        }
        results.push(h('br'));
        break;
      case 'td':
        if (!inTable) {
          inTable = true;
          results.push(h('table', []));
        }
        // 找到对应行
        while (lastRow !== element.tableRow) {
          results[results.length - 1].children.push(h('tr', []));
          lastRow++;
          lastCol = -1;
        }
        while (lastCol !== element.tableCol) {
          results[results.length - 1].children[element.tableRow].children.push(h('td'));
          lastCol++;
        }
        // 这里拼接没有处理同一格换行
        if (results[results.length - 1].children[element.tableRow].children[element.tableCol].props) {
          results[results.length - 1].children[element.tableRow].children[element.tableCol].props.textContent +=
            element.textContent;
        } else {
          results[results.length - 1].children[element.tableRow].children[element.tableCol].props = element;
        }
        break;
      default:
        results.push(h(element.type, element))
        break;
    }
  });
  return h('div', results);
}

export function render(renderInfos: RenderInfo[], container: Element, options: RendererOptions) {
  const { render: r } = createRenderer(options);
  const vnode = getRenderVNode(renderInfos);
  r(vnode as any, container);
}