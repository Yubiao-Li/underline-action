import { EMPTY_OBJ, EMPTY_ARR } from './general';
import { PatchFlags } from './patchFlags';
import {
  Text,
  VNode,
  cloneIfMounted,
  normalizeVNode,
  RendererElement,
  RendererNode,
  ShapeFlags,
  VNodeProps,
  VNodeArrayChildren,
  isSameVNodeType,
  Fragment,
} from './vnode';

export type Data = Record<string, unknown>;

export interface RendererOptions {
  patchProp(
    el: RendererElement,
    key: string,
    prevValue: any,
    nextValue: any,
    isSVG?: boolean,
    prevChildren?: VNode<RendererNode, RendererElement>[],
    parentComponent?: null,
    parentSuspense?: null,
    unmountChildren?: UnmountChildrenFn,
  ): void;
  insert(el: RendererNode, parent: RendererElement, anchor?: RendererNode | null): void;
  remove?(el: RendererNode): void;
  createElement(
    type: string,
    isSVG?: boolean,
    isCustomizedBuiltIn?: string,
    vnodeProps?: (VNodeProps & { [key: string]: any }) | null,
  ): RendererElement;
  createText(text: string): RendererNode;
  createComment?(text: string): RendererNode;
  setText?(node: RendererNode, text: string): void;
  setElementText?(node: RendererElement, text: string): void;
  parentNode?(node: RendererNode): RendererElement | null;
  nextSibling?(node: RendererNode): RendererElement | null;

  // // 可选的, DOM 特有的
  // querySelector?(selector: string): HostElement | null
  // setScopeId?(el: HostElement, id: string): void
  // cloneNode?(node: HostNode): HostNode
  // insertStaticContent?(
  //   content: string,
  //   parent: HostElement,
  //   anchor: HostNode | null,
  //   isSVG: boolean
  // ): [HostNode, HostNode]
}

type UnmountChildrenFn = (
  children: VNode[],
  parentComponent: null,
  parentSuspense: null,
  doRemove?: boolean,
  optimized?: boolean,
  start?: number,
) => void;
type PatchFn = (
  n1: VNode | null, // null means this is a mount
  n2: VNode,
  container: RendererElement,
  anchor?: RendererNode | null,
  parentComponent?: null,
  parentSuspense?: null,
  isSVG?: boolean,
  slotScopeIds?: string[] | null,
  optimized?: boolean,
) => void;

type PatchChildrenFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: null,
  parentSuspense: null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean,
) => void;
type ProcessTextOrCommentFn = (
  n1: VNode | null,
  n2: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
) => void;

type UnmountFn = (
  vnode: VNode,
  parentComponent: null,
  parentSuspense: null,
  doRemove?: boolean,
  optimized?: boolean,
) => void;

type MountChildrenFn = (
  children: VNodeArrayChildren,
  container: RendererElement,
  anchor: RendererNode | null,
  parentComponent: null,
  parentSuspense: null,
  isSVG: boolean,
  slotScopeIds: string[] | null,
  optimized: boolean,
  start?: number,
) => void;

export const enum MoveType {
  ENTER,
  LEAVE,
  REORDER,
}

type MoveFn = (
  vnode: VNode,
  container: RendererElement,
  anchor: RendererNode | null,
  type: MoveType,
  parentSuspense?: null,
) => void;

type RemoveFn = (vnode: VNode) => void;
export function createRenderer(options: RendererOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    // setScopeId: hostSetScopeId = NOOP,
    // insertStaticContent: hostInsertStaticContent
  } = options;

  // const getNextHostNode: NextFn = vnode => {
  // if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
  //   return getNextHostNode(vnode.component!.subTree);
  // }
  // return hostNextSibling((vnode.anchor || vnode.el)!);
  // };

  const processText: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children as string)), container, anchor);
    } else {
      const el = (n2.el = n1.el!);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children as string);
      }
    }
  };

  const patchProps = (
    el: RendererElement,
    vnode: VNode,
    oldProps: Data,
    newProps: Data,
    parentComponent: null,
    parentSuspense: null,
    isSVG: boolean,
  ) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              isSVG,
              vnode.children as VNode[],
              parentComponent,
              parentSuspense,
              unmountChildren,
            );
          }
        }
      }
      for (const key in newProps) {
        // empty string is not valid prop
        const next = newProps[key];
        const prev = oldProps[key];
        // defer patching value
        if (next !== prev && key !== 'value') {
          hostPatchProp(
            el,
            key,
            prev,
            next,
            isSVG,
            vnode.children as VNode[],
            parentComponent,
            parentSuspense,
            unmountChildren,
          );
        }
      }
      if ('value' in newProps) {
        hostPatchProp(el, 'value', oldProps.value, newProps.value);
      }
    }
  };

  const patchUnkeyedChildren = (
    c1: VNode[],
    c2: VNodeArrayChildren,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: null,
    parentSuspense: null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = (c2[i] = optimized ? cloneIfMounted(c2[i] as VNode) : normalizeVNode(c2[i]));
      patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
    if (oldLength > newLength) {
      // remove old
      unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
    } else {
      // mount new
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized,
        commonLength,
      );
    }
  };

  // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
  function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
      const arrI = arr[i];
      if (arrI !== 0) {
        j = result[result.length - 1];
        if (arr[j] < arrI) {
          p[i] = j;
          result.push(i);
          continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
          c = (u + v) >> 1;
          if (arr[result[c]] < arrI) {
            u = c + 1;
          } else {
            v = c;
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1];
          }
          result[u] = i;
        }
      }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
      result[u] = v;
      v = p[v];
    }
    return result;
  }

  const move: MoveFn = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, children, shapeFlag } = vnode;

    // single nodes
    hostInsert(el!, container, anchor);
  };

  // can be all-keyed or mixed
  const patchKeyedChildren = (
    c1: VNode[],
    c2: VNodeArrayChildren,
    container: RendererElement,
    parentAnchor: RendererNode | null,
    parentComponent: null,
    parentSuspense: null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1; // prev ending index
    let e2 = l2 - 1; // next ending index

    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = (c2[i] = optimized ? cloneIfMounted(c2[i] as VNode) : normalizeVNode(c2[i]));
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      i++;
    }

    // 2. sync from end
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = (c2[e2] = optimized ? cloneIfMounted(c2[e2] as VNode) : normalizeVNode(c2[e2]));
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? (c2[nextPos] as VNode).el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            (c2[i] = optimized ? cloneIfMounted(c2[i] as VNode) : normalizeVNode(c2[i])),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
          );
          i++;
        }
      }
    }

    // 4. common sequence + unmount
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    }

    // 5. unknown sequence
    // [i ... e1 + 1]: a b [c d e] f g
    // [i ... e2 + 1]: a b [e d c h] f g
    // i = 2, e1 = 4, e2 = 5
    else {
      const s1 = i; // prev starting index
      const s2 = i; // next starting index

      // 5.1 build key:index map for newChildren
      const keyToNewIndexMap: Map<string | number | symbol, number> = new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = (c2[i] = optimized ? cloneIfMounted(c2[i] as VNode) : normalizeVNode(c2[i]));
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }

      // 5.2 loop through old children left to be patched and try to patch
      // matching nodes & remove nodes that are no longer present
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      // used to track whether any node has moved
      let maxNewIndexSoFar = 0;
      // works as Map<newIndex, oldIndex>
      // Note that oldIndex is offset by +1
      // and oldIndex = 0 is a special value indicating the new node has
      // no corresponding old node.
      // used for determining longest stable subsequence
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          // all new children have been patched so this can only be a removal
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // key-less node, try to locate a key-less node of the same type
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j] as VNode)) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex] as VNode,
            container,
            null,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
          );
          patched++;
        }
      }

      // 5.3 move and mount
      // generate longest stable subsequence only when nodes have moved
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      // looping backwards so that we can use last patched node as anchor
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex] as VNode;
        const anchor = nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          // mount new
          patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        } else if (moved) {
          // move if:
          // There is no stable subsequence (e.g. a reverse)
          // OR current node is not among the stable sequence
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, MoveType.REORDER);
          } else {
            j--;
          }
        }
      }
    }
  };

  const patchChildren: PatchChildrenFn = (
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    optimized = false,
  ) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;

    const { patchFlag, shapeFlag } = n2;
    // fast path
    if (patchFlag > 0) {
      if (patchFlag & PatchFlags.KEYED_FRAGMENT) {
        // this could be either fully-keyed or mixed (some keyed some not)
        // presence of patchFlag means children are guaranteed to be arrays
        patchKeyedChildren(
          c1 as VNode[],
          c2 as VNodeArrayChildren,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
        );
        return;
      } else if (patchFlag & PatchFlags.UNKEYED_FRAGMENT) {
        // unkeyed
        patchUnkeyedChildren(
          c1 as VNode[],
          c2 as VNodeArrayChildren,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          isSVG,
          slotScopeIds,
          optimized,
        );
        return;
      }
    }

    // children has 3 possibilities: text, array or no children.
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text children fast path
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as VNode[], parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2 as string);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // prev children was array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // two arrays, cannot assume anything, do full diff
          patchKeyedChildren(
            c1 as VNode[],
            c2 as VNodeArrayChildren,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
          );
        } else {
          // no new children, just unmount old
          unmountChildren(c1 as VNode[], parentComponent, parentSuspense, true);
        }
      } else {
        // prev children was text OR null
        // new children is array OR null
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '');
        }
        // mount new if array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(
            c2 as VNodeArrayChildren,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            isSVG,
            slotScopeIds,
            optimized,
          );
        }
      }
    }
  };

  const patchElement = (
    n1: VNode,
    n2: VNode,
    parentComponent: null,
    parentSuspense: null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    const el = (n2.el = n1.el!);
    let { patchFlag, dynamicChildren } = n2;
    // #1426 take the old vnode's patch flag into account since user may clone a
    // compiler-generated vnode, which de-opts to FULL_PROPS
    patchFlag |= n1.patchFlag & PatchFlags.FULL_PROPS;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;

    const areChildrenSVG = isSVG && n2.type !== 'foreignObject';
    if (dynamicChildren) {
      // patchBlockChildren(
      //   n1.dynamicChildren!,
      //   dynamicChildren,
      //   el,
      //   parentComponent,
      //   parentSuspense,
      //   areChildrenSVG,
      //   slotScopeIds,
      // );
    } else if (!optimized) {
      // full diff
      patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
    }

    if (patchFlag > 0) {
      // the presence of a patchFlag means this element's render code was
      // generated by the compiler and can take the fast path.
      // in this path old node and new node are guaranteed to have the same shape
      // (i.e. at the exact same position in the source template)
      if (patchFlag & PatchFlags.FULL_PROPS) {
        // element props contain dynamic keys, full diff needed
        patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
      } else {
        // class
        // this flag is matched when the element has dynamic class bindings.
        if (patchFlag & PatchFlags.CLASS) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, 'class', null, newProps.class, isSVG);
          }
        }

        // style
        // this flag is matched when the element has dynamic style bindings
        if (patchFlag & PatchFlags.STYLE) {
          hostPatchProp(el, 'style', oldProps.style, newProps.style, isSVG);
        }

        // props
        // This flag is matched when the element has dynamic prop/attr bindings
        // other than class and style. The keys of dynamic prop/attrs are saved for
        // faster iteration.
        // Note dynamic keys like :[foo]="bar" will cause this optimization to
        // bail out and go through a full diff because we need to unset the old key
        if (patchFlag & PatchFlags.PROPS) {
          // if the flag is present then dynamicProps must be non-null
          const propsToUpdate = n2.dynamicProps!;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            // #1471 force patch value
            if (next !== prev || key === 'value') {
              hostPatchProp(
                el,
                key,
                prev,
                next,
                isSVG,
                n1.children as VNode[],
                parentComponent,
                parentSuspense,
                unmountChildren,
              );
            }
          }
        }
      }

      // text
      // This flag is matched when the element has only dynamic text children.
      if (patchFlag & PatchFlags.TEXT) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children as string);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      // unoptimized, full diff
      patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
    }

    // if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
    //   queuePostRenderEffect(() => {
    //     vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1)
    //     dirs && invokeDirectiveHook(n2, n1, parentComponent, 'updated')
    //   }, parentSuspense)
    // }
  };

  const processElement = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: null,
    parentSuspense: null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    isSVG = isSVG || (n2.type as string) === 'svg';
    if (n1 == null) {
      mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };

  const processFragment = (
    n1: VNode | null,
    n2: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: null,
    parentSuspense: null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    // const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(''))!;
    // const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : hostCreateText(''))!;

    // let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;

    if (n1 == null) {
      // hostInsert(fragmentStartAnchor, container, anchor);
      // hostInsert(fragmentEndAnchor, container, anchor);
      // a fragment can only have array children
      // since they are either generated by the compiler, or implicitly created
      // from arrays.
      mountChildren(
        n2.children as VNodeArrayChildren,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized,
      );
    } else {
      // keyed / unkeyed, or manual fragments.
      // for keyed & unkeyed, since they are compiler generated from v-for,
      // each child is guaranteed to be a block so the fragment will never
      // have dynamicChildren.
      patchChildren(
        n1,
        n2,
        container,
        null,
        parentComponent,
        parentSuspense,
        isSVG,
        slotScopeIds,
        optimized,
      );
    }
  };

  const patch: PatchFn = (
    n1,
    n2,
    container,
    anchor = null,
    parentComponent = null,
    parentSuspense = null,
    isSVG = false,
    slotScopeIds = null,
    optimized = false,
  ) => {
    if (n1 === n2) {
      return;
    }

    // patching & not same type, unmount old tree
    // if (n1 && !isSameVNodeType(n1, n2)) {
    //   anchor = getNextHostNode(n1);
    //   unmount(n1, parentComponent, parentSuspense, true);
    //   n1 = null;
    // }

    const { type, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      //   case Comment:
      //     processCommentNode(n1, n2, container, anchor);
      //     break;
      //   case Static:
      //     if (n1 == null) {
      //       mountStaticNode(n2, container, anchor, isSVG);
      //     } else if (__DEV__) {
      //       patchStaticNode(n1, n2, container, isSVG);
      //     }
      //     break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          // } else if (shapeFlag & ShapeFlags.COMPONENT) {
          //   processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
          // } else if (shapeFlag & ShapeFlags.TELEPORT) {
          //   (type as typeof TeleportImpl).process(
          //     n1 as TeleportVNode,
          //     n2 as TeleportVNode,
          //     container,
          //     anchor,
          //     parentComponent,
          //     parentSuspense,
          //     isSVG,
          //     slotScopeIds,
          //     optimized,
          //     internals,
          //   );
          // } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
          //   (type as typeof SuspenseImpl).process(
          //     n1,
          //     n2,
          //     container,
          //     anchor,
          //     parentComponent,
          //     parentSuspense,
          //     isSVG,
          //     slotScopeIds,
          //     optimized,
          //     internals,
          //   );
          // } else if (__DEV__) {
          //   warn('Invalid VNode type:', type, `(${typeof type})`);
        }
    }
  };

  /**
   * Dev / HMR only
   */
  const mountChildren: MountChildrenFn = (
    children,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    isSVG,
    slotScopeIds,
    optimized,
    start = 0,
  ) => {
    for (let i = start; i < children.length; i++) {
      const child = (children[i] = optimized ? cloneIfMounted(children[i] as any) : normalizeVNode(children[i] as any));
      // const child = (children[i] = optimized ? cloneIfMounted(children[i] as VNode) : normalizeVNode(children[i]));
      patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  };

  const unmountChildren: UnmountChildrenFn = (
    children,
    parentComponent,
    parentSuspense,
    doRemove = false,
    optimized = false,
    start = 0,
  ) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const mountElement = (
    vnode: VNode,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: null,
    parentSuspense: null,
    isSVG: boolean,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    let el: RendererElement;
    const { type, props, shapeFlag } = vnode;

    el = vnode.el = hostCreateElement(vnode.type as string, isSVG, props && props.is, props);

    // mount children first, since some props may rely on child content
    // being already rendered, e.g. `<select value>`
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children as string);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(
        vnode.children as VNodeArrayChildren,
        el,
        null,
        parentComponent,
        parentSuspense,
        isSVG && type !== 'foreignObject',
        slotScopeIds,
        optimized,
      );
    }

    // if (dirs) {
    //   invokeDirectiveHook(vnode, null, parentComponent, 'created')
    // }
    // // scopeId
    // setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent)
    // // props
    if (props) {
      for (const key in props) {
        if (key !== 'value') {
          hostPatchProp(
            el,
            key,
            null,
            props[key],
            isSVG,
            vnode.children as unknown as VNode[],
            parentComponent,
            parentSuspense,
            unmountChildren,
          );
        }
      }
      /**
       * Special case for setting value on DOM elements:
       * - it can be order-sensitive (e.g. should be set *after* min/max, #2325, #4024)
       * - it needs to be forced (#1471)
       * #2353 proposes adding another renderer option to configure this, but
       * the properties affects are so finite it is worth special casing it
       * here to reduce the complexity. (Special casing it also should not
       * affect non-DOM renderers)
       */
      if ('value' in props) {
        hostPatchProp(el, 'value', null, props.value);
      }
      // if ((vnodeHook = props.onVnodeBeforeMount)) {
      //   invokeVNodeHook(vnodeHook, parentComponent, vnode);
      // }
    }

    // if (__DEV__ || __FEATURE_PROD_DEVTOOLS__) {
    //   Object.defineProperty(el, '__vnode', {
    //     value: vnode,
    //     enumerable: false
    //   })
    //   Object.defineProperty(el, '__vueParentComponent', {
    //     value: parentComponent,
    //     enumerable: false
    //   })
    // }
    // if (dirs) {
    //   invokeDirectiveHook(vnode, null, parentComponent, 'beforeMount')
    // }
    // // #1583 For inside suspense + suspense not resolved case, enter hook should call when suspense resolved
    // // #1689 For inside suspense + suspense resolved case, just call it
    // const needCallTransitionHooks =
    //   (!parentSuspense || (parentSuspense && !parentSuspense.pendingBranch)) &&
    //   transition &&
    //   !transition.persisted
    // if (needCallTransitionHooks) {
    //   transition!.beforeEnter(el)
    // }
    hostInsert(el, container, anchor);
    // if (
    //   (vnodeHook = props && props.onVnodeMounted) ||
    //   needCallTransitionHooks ||
    //   dirs
    // ) {
    //   queuePostRenderEffect(() => {
    //     vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode)
    //     needCallTransitionHooks && transition!.enter(el)
    //     dirs && invokeDirectiveHook(vnode, null, parentComponent, 'mounted')
    //   }, parentSuspense)
    // }
  };

  // const processCommentNode: ProcessTextOrCommentFn = (n1, n2, container, anchor) => {
  //   if (n1 == null) {
  //     hostInsert((n2.el = hostCreateComment((n2.children as string) || '')), container, anchor);
  //   } else {
  //     // there's no support for dynamic comments
  //     n2.el = n1.el;
  //   }
  // };

  // function updateProps(el: RendererNode, prevProps: { [x: string]: any }, nextProps: { [x: string]: any }) {
  //   for (let key in nextProps) {
  //     let prevValue = prevProps[key];
  //     let nextValue = nextProps[key];

  //     if (prevValue !== nextValue) {
  //       patchProp(el, key, prevValue, nextValue);
  //     }
  //   }
  // }

  const unmount: UnmountFn = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    remove(vnode);
  };

  const remove: RemoveFn = vnode => {
    const { type, el, anchor } = vnode;

    const performRemove = () => {
      hostRemove(el!);
    };

    performRemove();
  };

  // function updateChildren(
  //   el: { appendChild: (arg0: RendererElement) => void; removeChild: (arg0: any) => void },
  //   prevChildren: string | any[],
  //   nextChildren: string | any[],
  // ) {
  //   let prevLen = prevChildren.length;
  //   let nextLen = nextChildren.length;

  //   if (prevLen === 0 && nextLen === 0) {
  //     return;
  //   }

  //   if (prevLen === 0) {
  //     for (let i = 0; i < nextLen; i++) {
  //       el.appendChild(createElement(nextChildren[i]));
  //     }
  //   } else if (nextLen === 0) {
  //     for (let i = 0; i < prevLen; i++) {
  //       el.removeChild(prevChildren[i].el);
  //     }
  //   } else {
  //     let commonLen = Math.min(prevLen, nextLen);

  //     for (let i = 0; i < commonLen; i++) {
  //       patch(prevChildren[i], nextChildren[i]);
  //     }

  //     if (prevLen > nextLen) {
  //       for (let i = commonLen; i < prevLen; i++) {
  //         el.removeChild(prevChildren[i].el);
  //       }
  //     } else if (nextLen > prevLen) {
  //       for (let i = commonLen; i < nextLen; i++) {
  //         el.appendChild(createElement(nextChildren[i]));
  //       }
  //     }
  //   }
  // }

  return {
    render: (vnode: VNode, container: RendererElement, isSVG?: boolean) => {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode, null, null, true);
        }
      } else {
        patch(container._vnode || null, vnode, container, null, null, null, isSVG);
      }
      container._vnode = vnode;
    },
  };
}
