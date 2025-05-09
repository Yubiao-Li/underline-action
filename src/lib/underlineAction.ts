import { getScaleByDom } from './getScaleByDom';
import { inSameLine, needWrap, removeNowrapLinebreak } from './needWrap';
import { findFirstParent } from './findParent';
import { findAllLines } from './splitRange';
import { Options, SplitResult } from './type';
import { RenderInfoPlugin } from './plugins/renderInfo';
import { createHighlightSpan, isTextNode } from './utils';
import { AttachPlugin } from './plugins/attach';
import { SpecialNodePlugin } from './plugins/special';
import { BasePlugin } from './plugins/base';
import { ContentNodePlugin } from './plugins/content';

function defaultGetKeyByRange({ start, end }) {
  return `${start}-${end}`;
}

export function UnderlineAction(opt: Options) {
  let { getKeyByRange, tag, selector, needFilterNode } = opt;
  const _getKeyByRange = getKeyByRange ? getKeyByRange : defaultGetKeyByRange;
  const state: {
    textNodeArr: Text[];
    lastContentNode: Text | null;
    pluginFilterNode: any; // 一个节点被过滤了，那它的子节点也不能成为正文了
    mutationObserver: MutationObserver;
  } = {
    // 用来按顺序保存text节点方便后面遍历
    textNodeArr: [],
    lastContentNode: null,
    pluginFilterNode: null,
    mutationObserver: null,
  };
  let plugins: BasePlugin[];
  // 保存key对应的span列表，方便删除
  const spanNodeMap = {};
  const spanMockUnderlineMap = {};

  function insertSpanInRange(start: number, end: number, props: any = {}, temp = false) {
    let spans: HTMLSpanElement[] = [];

    function splitTextNode(textnode: Text, offset: number) {
      if (offset === 0) {
        return textnode;
      }
      if (textnode.textContent!.length === offset) {
        return textnode._next;
      }
      const behindTextNode = textnode.splitText(offset);
      behindTextNode._prev = textnode;
      behindTextNode._next = textnode._next;
      if (behindTextNode._next) {
        behindTextNode._next._prev = behindTextNode;
      }
      behindTextNode._wordoffset = textnode._wordoffset + offset;
      behindTextNode._renderInfo = textnode._renderInfo;

      textnode._next = behindTextNode;

      removeNowrapLinebreak(textnode);
      removeNowrapLinebreak(behindTextNode);

      state.textNodeArr.fill(
        behindTextNode,
        behindTextNode._wordoffset,
        behindTextNode.textContent!.length + behindTextNode._wordoffset
      );

      return behindTextNode;
    }

    // 分割textnode，把中间的取出来用span包住，并更新数组和链表
    function resolveTextNode(textnode: Text, startOffset: number, endOffset: number) {
      // 遍历插件，获取第一个有效的处理结果
      for (const plugin of plugins) {
        const result = plugin.resolveNode(textnode, startOffset, endOffset, props, opt);
        if (result) {
          spans.push(result);
          return textnode; // 直接返回插件处理后的结果
        }
      }

      const len = textnode.textContent!.length;
      let secondNode = textnode;
      if (startOffset !== 0) {
        secondNode = splitTextNode(textnode, startOffset);
      }
      if (endOffset !== len) {
        state.lastContentNode = splitTextNode(secondNode, endOffset - startOffset);
      }

      const span = createHighlightSpan(tag, props);
      spans.push(span);

      secondNode.parentElement!.insertBefore(span, secondNode);
      span.appendChild(secondNode);

      return secondNode;
    }

    try {
      if (end <= start) return;
      const underlineKey = _getKeyByRange({ start, end, props });
      props.underlineKey = underlineKey;
      const startTextNode = state.textNodeArr[start];
      const endTextNode = state.textNodeArr[end - 1];
      if (!startTextNode || !endTextNode) return;
      let curProcessTextNode = startTextNode;
      if (startTextNode === endTextNode) {
        // 如果是同一段，只需要分解一个节点就好了
        resolveTextNode(
          curProcessTextNode,
          start - curProcessTextNode._wordoffset,
          end - curProcessTextNode._wordoffset
        );
      } else {
        // 如果是不同段，需要一直遍历到最后一个节点，全部分割一遍
        do {
          // 分解之后要记得更新一下当前处理的节点指针为插入span的部分dom
          if (curProcessTextNode === startTextNode) {
            curProcessTextNode = resolveTextNode(
              curProcessTextNode,
              start - curProcessTextNode._wordoffset,
              curProcessTextNode.textContent!.length
            );
          } else if (curProcessTextNode === endTextNode) {
            curProcessTextNode = resolveTextNode(curProcessTextNode, 0, end - curProcessTextNode._wordoffset);
            break;
          } else {
            curProcessTextNode = resolveTextNode(curProcessTextNode, 0, curProcessTextNode.textContent!.length);
          }

          plugins.forEach(p => p.afterResolveNode(curProcessTextNode, start, end));

          curProcessTextNode = curProcessTextNode._next;
        } while (curProcessTextNode);
      }

      let fontCounts = new Map();
      // 初始化字数最多的字体及其字数
      let mostUsedFont = '';
      let maxCount = 0;
      let needProcessSpan: HTMLSpanElement[] = [];

      function wrapFontSpan(span: HTMLSpanElement, font: string) {
        // 包一个span，外面的span用来划线撑高度，里面的span用来保持字体
        const innerSpan = document.createElement('span');
        span._innerSpan = innerSpan;
        innerSpan.style.fontFamily = getComputedStyle(span).fontFamily;
        span.style.fontFamily = font;
        [...span.childNodes].forEach(child => {
          innerSpan.appendChild(child);
        });
        span.appendChild(innerSpan);
      }

      spans.forEach((s, i, arr) => {
        needProcessSpan.push(s);
        const style = getComputedStyle(s);
        if (fontCounts.has(style.fontFamily)) {
          fontCounts.set(style.fontFamily, fontCounts.get(style.fontFamily) + s.textContent!.length);
        } else {
          fontCounts.set(style.fontFamily, s.textContent!.length);
        }
        if (fontCounts.get(style.fontFamily) > maxCount) {
          maxCount = fontCounts.get(style.fontFamily);
          mostUsedFont = style.fontFamily;
        }

        if (!arr[i + 1] || needWrap(s, arr[i + 1])) {
          needProcessSpan.forEach(needS => {
            if (getComputedStyle(needS).fontFamily !== mostUsedFont) {
              wrapFontSpan(needS, mostUsedFont);
            }
          });
          needProcessSpan = [];
        }
      });

      // spans = [...spans, ...attachMockSpans];
      if (temp) {
        return spans;
      } else {
        spanNodeMap[underlineKey] = spans;
        return underlineKey;
      }
    } catch (error) {
      console.error(error);
    }
  }

  function mockUnderline(
    start: number,
    end: number,
    props: any = {},
    container: HTMLElement | undefined = undefined,
    temp = false
  ) {
    const underlineKey = _getKeyByRange({ start, end });
    const spans = getSpanByKey(underlineKey);
    const fontScale = getScaleByDom();
    let splitResults: SplitResult[];

    function getSpanSplitResult(span: HTMLSpanElement): SplitResult[] {
      // 这里可能有坑，span的第一个子节点不一定是text节点，mark
      const rects = [...span.getClientRects()].filter(r => r.width !== 0);
      const textSplit = findAllLines(span)
        .map((r: Range, index: number) => {
          const item: SplitResult = {
            text: r.toString().replace('\n', ''),
            rect: rects[index],
          };

          if (!item.rect) return;
          const computeStyle = getComputedStyle(span);
          item.firstBlockParent = findFirstParent(span, dom => {
            return getComputedStyle(dom).display === 'block';
          });

          item.style = `text-align-last: justify; overflow-x: hidden; font-size:${
            parseFloat(computeStyle.fontSize) / fontScale
          }px; width: ${item.rect.right - item.rect.left}px; font-weight:${computeStyle.fontWeight}; font-family: ${
            computeStyle.fontFamily
          }; line-height: ${parseFloat(computeStyle.lineHeight) / fontScale}px`;
          return item;
        })
        .filter((i: any) => i);
      return textSplit;
    }
    if (spans.length === 0) {
      const underlineKey = insertSpanInRange(start, end);
      splitResults = getSpanByKey(underlineKey as string).reduce(
        (pre: any, cur: HTMLSpanElement) => [...pre, ...getSpanSplitResult(cur)],
        []
      );
      // 用完就删掉
      removeSpanByKey(underlineKey as string);
    } else {
      splitResults = spans.reduce((pre: any, cur: HTMLSpanElement) => [...pre, ...getSpanSplitResult(cur)], []);
    }
    let allRanges: any = {};
    const linePosition: number[] = [];
    for (let splitResult of splitResults) {
      let find = false;
      for (let i = 0; i < linePosition.length; i++) {
        if (Math.abs(splitResult.rect!.bottom - linePosition[i]) < 10) {
          allRanges[linePosition[i]].push(splitResult);
          find = true;
        }
      }
      if (!find) {
        linePosition.push(splitResult.rect!.bottom);
        allRanges[splitResult.rect!.bottom] = [splitResult];
      }
    }
    allRanges = Object.keys(allRanges)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .reduce((pre, cur) => {
        allRanges[cur].sort((a: SplitResult, b: SplitResult) => {
          return a.rect.left - b.rect.left;
        });
        pre.push(allRanges[cur]);
        return pre;
      }, [] as any[]);

    function createMockSpan(rects: Array<SplitResult>) {
      // 同一行的元素他们的第一个块级父元素应该都是一样的
      const firstBlockParent = rects[0].firstBlockParent;
      let mockContainer = container;
      if (!mockContainer) {
        // 但是每一行的父元素有可能不一样
        mockContainer = firstBlockParent;
      }
      mockContainer!.style.position = 'relative';
      const containerRect = mockContainer!.getClientRects()[0];
      const containerStyle = getComputedStyle(mockContainer!);
      const span = document.createElement(tag || 'span');

      const parentStyle = getComputedStyle(firstBlockParent!);
      // 同一行要以最高的位置为基准
      const top = rects.reduce((pre, cur) => {
        return Math.min(pre, cur.rect.top);
      }, rects[0].rect.top);
      span.setAttribute(
        'style',
        `position: absolute;color: transparent;z-index: 10;text-indent: 0;white-space: nowrap;overflow-x: hidden;top:${
          top - containerRect.top
        }px; left:${
          rects[0].rect.left - containerRect.left - parseFloat(containerStyle.borderLeftWidth)
        }px; font-size: ${parseFloat(parentStyle.fontSize) / fontScale}px; line-height: ${
          parseFloat(parentStyle.lineHeight) / fontScale
        }px;text-align-last: justify; `
      );

      mockContainer!.appendChild(span);

      rects.forEach((r, index) => {
        // inline-flex会影响下划线粗细，所以要再套一层
        // const flexS = document.createElement('span');
        const innerS = document.createElement('span');
        // flexS.appendChild(innerS);
        innerS.innerText = `${r.text}add long text`; // 为了防止长度不够手动加点文本，反正看不到
        innerS.setAttribute(
          'style',
          `${r.style}; margin-left: ${index === 0 ? 0 : r.rect.left - rects[index - 1].rect.right}px`
        );
        innerS.className = props.innerClass;
        // s.classList.add('mock_underline_child');
        span.appendChild(innerS);
      });
      // 先置为inline，用来算块级元素包含行内元素的高度差
      // 全部塞进去后，再算偏移才是准的
      const maxTopOffset = Math.max(
        ...Array.from(span.children).map(innerS => {
          return span.getBoundingClientRect().top - innerS.getBoundingClientRect().top;
        })
      );
      const maxBottomOffset = Math.max(
        ...Array.from(span.children).map(innerS => {
          return innerS.getBoundingClientRect().bottom - span.getBoundingClientRect().bottom;
        })
      );
      // 作者发现块级元素包含行内元素会导致块级元素和行内元素的top不同，而这个偏移值是我们模拟行内元素所需要的
      span.style.marginTop = `${maxTopOffset > 0 ? 0 : maxTopOffset}px`;

      // 外层p可能太矮了会截断span，用padding撑起
      span.style.padding = `${maxTopOffset > 0 ? maxTopOffset : 0}px 0 ${
        maxBottomOffset > 0 ? maxBottomOffset : 0
      }px 0`;
      // 要用inline-flex保持宽度
      Array.from(span.children).forEach((inner: Element) => ((inner as HTMLElement).style.display = 'inline-flex'));
      const containerWidth = parseFloat(getComputedStyle(span).width);
      span.style.width = `${containerWidth}px`;
      // 算完宽度后，要取消innerS的display，让他做个正常的inline，不然background对不准
      Array.from(span.children).forEach((inner: Element) => ((inner as HTMLElement).style.display = ''));
      span.className = 'underline';
      if (!temp) {
        if (spanMockUnderlineMap[underlineKey]) {
          spanMockUnderlineMap[underlineKey].push(span);
        } else {
          spanMockUnderlineMap[underlineKey] = [span];
        }
      }
      span.underlineKey = underlineKey;
      Object.keys(props).forEach(key => {
        if (key !== 'innerClass') {
          span[key] = props[key];
        }
      });
      return span;
    }

    const mockUnderlineSpans = allRanges.map((rects: SplitResult[]) => createMockSpan(rects));
    if (temp) {
      return mockUnderlineSpans;
    }
    return underlineKey;
  }

  function mergeTextNode(span: HTMLElement) {
    if (span._innerSpan) {
      [...span._innerSpan.childNodes].forEach(child => {
        span.appendChild(child);
      });
      span._innerSpan.remove();
      span._innerSpan = undefined;
    }
    const parentNode = span.parentNode!;
    let curTextNode: any;
    // 把所有子节点拿到外面
    while ((curTextNode = span.childNodes[0])) {
      parentNode.insertBefore(curTextNode, span);
    }
    span.remove();
    // 在合并textnode前，找到连续的textnode节点并重新指定_prev和_next
    let firstTextNode: Text | null;
    parentNode.childNodes.forEach((child: any) => {
      if (isTextNode(child)) {
        if (!firstTextNode) firstTextNode = child;
        state.textNodeArr.fill(firstTextNode!, child._wordoffset, child._wordoffset + child.textContent!.length);
        if (child._next) {
          child._next._prev = firstTextNode;
        }
        firstTextNode!._next = child._next;
      } else {
        firstTextNode = null;
      }
    });
    parentNode.normalize();
    // 合并完text节点后，要更新_text
    parentNode.childNodes.forEach(child => {
      if (isTextNode(child)) {
        removeNowrapLinebreak(child as Text);
      }
    });
  }

  function getTextByStartEnd(start: number, end: number) {
    try {
      if (end <= start) return '';
      const startNode = state.textNodeArr[start];
      const endNode = state.textNodeArr[end - 1];
      if (!startNode || !endNode) {
        console.warn('超出边界的offset');
        return '';
      }
      let text = '';
      let curNode: Text | null = null;
      while (curNode !== endNode) {
        if (!curNode) {
          curNode = startNode;
        } else {
          curNode = curNode._next;
          if (needWrap(curNode, curNode._prev)) {
            text += '\n';
          }
        }
        if (isTextNode(curNode)) {
          const sliceStart = Math.max(0, start - curNode._wordoffset);
          const sliceEnd = Math.min(end - curNode._wordoffset, curNode._text!.length);
          text += curNode._text!.slice(sliceStart, sliceEnd);
        } else {
          text += curNode._text;
        }
      }

      return text;
    } catch (error) {
      console.error(error);
    }
  }

  function removeSpanByKey(underlineKey: string | number, mock = false) {
    if (mock) {
      if (spanMockUnderlineMap[underlineKey]) {
        spanMockUnderlineMap[underlineKey].forEach((s: { remove: () => any }) => s.remove());
        delete spanMockUnderlineMap[underlineKey];
      }
    } else {
      if (spanNodeMap[underlineKey]) {
        spanNodeMap[underlineKey].forEach(mergeTextNode);
        delete spanNodeMap[underlineKey];
      }
    }
  }

  function getSpanByKey(underlineKey: string | number, mock = false) {
    if (mock) {
      return spanMockUnderlineMap[underlineKey] || [];
    }
    return spanNodeMap[underlineKey] || [];
  }

  // 获取文章总字数
  function getTotalCount() {
    return state.textNodeArr.length;
  }

  function getNativeRangeByStartAndEnd(start: number, end: number) {
    if (end <= start) return null;
    const startContainer = state.textNodeArr[start];
    const endContainer = state.textNodeArr[end - 1];
    if (!startContainer || !endContainer) return null;
    const range = document.createRange();
    range.setStart(startContainer, start - startContainer._wordoffset);
    range.setEnd(endContainer, end - endContainer._wordoffset);
    return range;
  }

  function getNodeAndOffset(offset: number, preferPrevNode = false) {
    if (preferPrevNode) {
      if (state.textNodeArr[offset - 1]) {
        return {
          node: state.textNodeArr[offset - 1],
          offset: offset - state.textNodeArr[offset - 1]._wordoffset,
        };
      }
    }
    return {
      node: state.textNodeArr[offset],
      offset: offset - state.textNodeArr[offset]?._wordoffset,
    };
  }

  function getOffset(node: Text, offset: number) {
    return node._wordoffset + offset;
  }

  function computeDom(dom) {
    if (!dom) return;
    const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ALL, {
      acceptNode: needFilterNode || (() => NodeFilter.FILTER_ACCEPT),
    });
    let currentNode = treeWalker.currentNode as any;

    while (currentNode) {
      const offset = state.textNodeArr.length;
      currentNode._wordoffset = offset;

      const isMainText = plugins.reduce((pre, cur) => {
        return pre && cur.process(currentNode, opt);
      }, true);

      if (isMainText) {
        if ((opt.shadowNodeWhiteList || []).indexOf(currentNode.tagName) !== -1) {
          computeDom(currentNode.shadowRoot);
        } else if (isTextNode(currentNode) && !state.pluginFilterNode?.contains(currentNode)) {
          removeNowrapLinebreak(currentNode);
          if (state.lastContentNode) {
            // 做个链表
            state.lastContentNode._next = currentNode;
            currentNode._prev = state.lastContentNode;
          }
          const wordLen = currentNode.textContent.length;
          const newOffset = offset + wordLen;
          state.textNodeArr.length = newOffset;
          state.textNodeArr.fill(currentNode, offset, newOffset);
          state.lastContentNode = currentNode;
        }
      } else {
        state.pluginFilterNode = currentNode;
      }
      currentNode = treeWalker.nextNode();
    }
  }

  function computeDomPos() {
    state.mutationObserver?.disconnect();
    plugins = [
      new RenderInfoPlugin(state),
      new AttachPlugin(state),
      new SpecialNodePlugin(state),
      new ContentNodePlugin(state),
    ];
    plugins.forEach(p => (p.instance = this));
    state.textNodeArr = [];
    const dom = typeof selector === 'string' ? document.querySelector(selector) : selector;

    computeDom(dom);

    state.mutationObserver = new MutationObserver(mutations => {
      // 非遍历阶段不要记录上一个节点
      state.lastContentNode = null;
      mutations.forEach(mutation => {
        if (
          mutation.type === 'childList' &&
          mutation.addedNodes.length > 0 &&
          mutation.addedNodes.length === mutation.removedNodes.length
        ) {
          // 只处理替换场景
          const oldNode = mutation.removedNodes[0] as Text;
          const newNode = mutation.addedNodes[0] as HTMLElement;
          if (oldNode._prev || oldNode._next) {
            // 说明是正文节点
            newNode._wordoffset = oldNode._wordoffset;
            if (oldNode._prev) {
              newNode._prev = oldNode._prev;
              oldNode._prev._next = newNode;
            }
            if (oldNode._next) {
              newNode._next = oldNode._next;
              oldNode._next._prev = newNode;
            }
            plugins.forEach(p => {
              if (p.process) {
                p.process(newNode, opt);
              }
            });
          }
        }
      });
    });
    state.mutationObserver.observe(dom, {
      childList: true,
      subtree: true
    });
    return state.textNodeArr;
  }
  computeDomPos();

  const exportFuncs = {
    insertSpanInRange,
    getTextByStartEnd,
    removeSpanByKey,
    getSpanByKey,
    getTotalCount,
    getNativeRangeByStartAndEnd,
    mockUnderline,
    computeDomPos,
    mergeTextNode,
    getNodeAndOffset,
    getOffset,
  };
  plugins.forEach(p => {
    p.exportFuncs.forEach(f => (exportFuncs[f] = p[f].bind(p)));
  });

  return exportFuncs;
}
