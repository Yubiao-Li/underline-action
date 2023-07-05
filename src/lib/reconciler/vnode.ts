// import {
//   VNodeNormalizedChildren,
//   VNodeProps,
//   cloneVNode,
//   createTextVNode,
// } from '@vue/runtime-core';
import { isArray, isOn } from './general';
import { PatchFlags } from './patchFlags';
import { normalizeClass, normalizeStyle } from './shared';

export interface RendererNode {
  [key: string]: any;
}

export interface RendererElement extends RendererNode {}

export type VNodeProps = {
  key?: string | number | symbol;
  // ref?: VNodeRef
  ref_for?: boolean;
  ref_key?: string;

  // vnode hooks
  // onVnodeBeforeMount?: VNodeMountHook | VNodeMountHook[]
  // onVnodeMounted?: VNodeMountHook | VNodeMountHook[]
  // onVnodeBeforeUpdate?: VNodeUpdateHook | VNodeUpdateHook[]
  // onVnodeUpdated?: VNodeUpdateHook | VNodeUpdateHook[]
  // onVnodeBeforeUnmount?: VNodeMountHook | VNodeMountHook[]
  // onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[]
};

export type VNodeNormalizedChildren = string | VNodeArrayChildren | null;

export interface VNode<HostNode = RendererNode, HostElement = RendererElement, ExtraProps = { [key: string]: any }> {
  /**
   * @internal
   */
  __v_isVNode: true;

  /**
   * @internal
   */
  // [ReactiveFlags.SKIP]: true

  type: VNodeTypes;
  props: (VNodeProps & ExtraProps) | null;
  key: string | number | symbol | null;
  // ref: VNodeNormalizedRef | null
  /**
   * SFC only. This is assigned on vnode creation using currentScopeId
   * which is set alongside currentRenderingInstance.
   */
  scopeId: string | null;
  /**
   * SFC only. This is assigned to:
   * - Slot fragment vnodes with :slotted SFC styles.
   * - Component vnodes (during patch/hydration) so that its root node can
   *   inherit the component's slotScopeIds
   * @internal
   */
  slotScopeIds: string[] | null;
  children: VNodeNormalizedChildren;
  component: null;
  // dirs: DirectiveBinding[] | null
  // transition: TransitionHooks<HostElement> | null

  // DOM
  el: HostNode | null;
  anchor: HostNode | null; // fragment anchor
  target: HostElement | null; // teleport target
  targetAnchor: HostNode | null; // teleport target anchor
  /**
   * number of elements contained in a static vnode
   * @internal
   */
  staticCount: number;

  // suspense
  // suspense: SuspenseBoundary | null
  /**
   * @internal
   */
  ssContent: VNode | null;
  /**
   * @internal
   */
  ssFallback: VNode | null;

  // optimization only
  shapeFlag: number;
  patchFlag: number;
  /**
   * @internal
   */
  dynamicProps: string[] | null;
  /**
   * @internal
   */
  dynamicChildren: VNode[] | null;

  // application root node only
  // appContext: AppContext | null

  /**
   * @internal lexical scope owner instance
   */
  ctx: null;

  /**
   * @internal attached by v-memo
   */
  memo?: any[];
  /**
   * @internal __COMPAT__ only
   */
  isCompatRoot?: true;
  /**
   * @internal custom element interception hook
   */
  ce?: (instance: null) => void;
}

type VNodeChildAtom = VNode | string | number | boolean | null | undefined | void;

export type VNodeArrayChildren = Array<VNodeArrayChildren | VNodeChildAtom>;

export type VNodeChild = VNodeChildAtom | VNodeArrayChildren;

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}

export type VNodeTypes = string | VNode | typeof Text | typeof Static | typeof Comment | typeof Fragment;

export function isSameVNodeType(n1: VNode, n2: VNode): boolean {
  return n1.type === n2.type && n1.key === n2.key;
}
export const Fragment = Symbol.for('v-fgt') as any as {
  __isFragment: true;
  new (): {
    $props: VNodeProps;
  };
};
export type Data = Record<string, unknown>;
export const Text = Symbol.for('v-txt');
export const Comment = Symbol.for('v-cmt');
export const Static = Symbol.for('v-stc');
export let currentScopeId: string | null = null;
export let currentRenderingInstance: null = null;

const normalizeKey = ({ key }: VNodeProps): VNode['key'] => (key != null ? key : null);

const normalizeRef = (_: VNodeProps): null => {
  return null;
};

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
    // } else if (typeof children === 'object') {
    //   if (shapeFlag & (ShapeFlags.ELEMENT | ShapeFlags.TELEPORT)) {
    //     // Normalize slot to plain children for plain element and Teleport
    //     const slot = (children as any).default
    //     if (slot) {
    //       // _c marker is added by withCtx() indicating this is a compiled slot
    //       slot._c && (slot._d = false)
    //       normalizeChildren(vnode, slot())
    //       slot._c && (slot._d = true)
    //     }
    //     return
    //   } else {
    //     type = ShapeFlags.SLOTS_CHILDREN
    //     const slotFlag = (children as RawSlots)._
    //     if (!slotFlag && !(InternalObjectKey in children!)) {
    //       // if slots are not normalized, attach context instance
    //       // (compiled / normalized slots already have context)
    //       ;(children as RawSlots)._ctx = currentRenderingInstance
    //     } else if (slotFlag === SlotFlags.FORWARDED && currentRenderingInstance) {
    //       // a child component receives forwarded slots from the parent.
    //       // its slot type is determined by its parent's slot type.
    //       if (
    //         (currentRenderingInstance.slots as RawSlots)._ === SlotFlags.STABLE
    //       ) {
    //         ;(children as RawSlots)._ = SlotFlags.STABLE
    //       } else {
    //         ;(children as RawSlots)._ = SlotFlags.DYNAMIC
    //         vnode.patchFlag |= PatchFlags.DYNAMIC_SLOTS
    //       }
    //     }
    //   }
    // } else if (isFunction(children)) {
    //   children = { default: children, _ctx: currentRenderingInstance }
    //   type = ShapeFlags.SLOTS_CHILDREN
  } else {
    children = String(children);
    // force teleport children to array so it can be moved around
    if (shapeFlag & ShapeFlags.TELEPORT) {
      type = ShapeFlags.ARRAY_CHILDREN;
      children = [createTextVNode(children as string)];
    } else {
      type = ShapeFlags.TEXT_CHILDREN;
    }
  }
  vnode.children = children as VNodeNormalizedChildren;
  vnode.shapeFlag |= type;
}

export function createTextVNode(text: string = ' ', flag: number = 0): VNode {
  return createVNode(Text, null, text, flag);
}

function createBaseVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag = 0,
  dynamicProps: string[] | null = null,
  shapeFlag = 0,
  isBlockNode = false,
  needFullChildrenNormalization = false,
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance,
  } as VNode;

  // if (needFullChildrenNormalization) {
  //   normalizeChildren(vnode, children);
  //   // normalize suspense children
  //   if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {
  //     (type as typeof SuspenseImpl).normalize(vnode);
  //   }
  // } else if (children) {
  //   // compiled element vnode - if children is passed, only possible types are
  //   // string or Array.
  //   vnode.shapeFlag |= isString(children) ? ShapeFlags.TEXT_CHILDREN : ShapeFlags.ARRAY_CHILDREN;
  // }

  // // validate key
  // if (__DEV__ && vnode.key !== vnode.key) {
  //   warn(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
  // }

  // // track vnode for block tree
  // if (
  //   isBlockTreeEnabled > 0 &&
  //   // avoid a block node from tracking itself
  //   !isBlockNode &&
  //   // has current parent block
  //   currentBlock &&
  //   // presence of a patch flag indicates this node needs patching on updates.
  //   // component nodes also should always be patched, because even if the
  //   // component doesn't need to update, it needs to persist the instance on to
  //   // the next vnode so that it can be properly unmounted later.
  //   (vnode.patchFlag > 0 || shapeFlag & ShapeFlags.COMPONENT) &&
  //   // the EVENTS flag is only for hydration and if it is the only flag, the
  //   // vnode should not be considered dynamic due to handler caching.
  //   vnode.patchFlag !== PatchFlags.HYDRATE_EVENTS
  // ) {
  //   currentBlock.push(vnode);
  // }

  // if (__COMPAT__) {
  //   convertLegacyVModelProps(vnode);
  //   defineLegacyVNodeProperties(vnode);
  // }

  return vnode;
}

export { createBaseVNode as createElementVNode };

export const createVNode = _createVNode as typeof _createVNode;

function _createVNode(
  type: VNodeTypes,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  patchFlag: number = 0,
  dynamicProps: string[] | null = null,
  isBlockNode = false,
): VNode {
  // if (!type || type === NULL_DYNAMIC_COMPONENT) {
  //   if (__DEV__ && !type) {
  //     warn(`Invalid vnode type when creating vnode: ${type}.`);
  //   }
  //   type = Comment;
  // }

  // if (isVNode(type)) {
  //   // createVNode receiving an existing vnode. This happens in cases like
  //   // <component :is="vnode"/>
  //   // #2078 make sure to merge refs during the clone instead of overwriting it
  //   const cloned = cloneVNode(type, props, true /* mergeRef: true */);
  //   if (children) {
  //     normalizeChildren(cloned, children);
  //   }
  //   if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
  //     if (cloned.shapeFlag & ShapeFlags.COMPONENT) {
  //       currentBlock[currentBlock.indexOf(type)] = cloned;
  //     } else {
  //       currentBlock.push(cloned);
  //     }
  //   }
  //   cloned.patchFlag |= PatchFlags.BAIL;
  //   return cloned;
  // }

  // class component normalization.
  // if (isClassComponent(type)) {
  //   type = type.__vccOpts;
  // }

  // 2.x async/functional component compat
  // if (__COMPAT__) {
  //   type = convertLegacyComponent(type, currentRenderingInstance);
  // }

  // class & style normalization.
  // if (props) {
  //   // for reactive or proxy objects, we need to clone it to enable mutation.
  //   props = guardReactiveProps(props)!;
  //   let { class: klass, style } = props;
  //   if (klass && !isString(klass)) {
  //     props.class = normalizeClass(klass);
  //   }
  //   if (isObject(style)) {
  //     // reactive state objects need to be cloned since they are likely to be
  //     // mutated
  //     if (isProxy(style) && !isArray(style)) {
  //       style = extend({}, style);
  //     }
  //     props.style = normalizeStyle(style);
  //   }
  // }

  // // encode the vnode type information into a bitmap
  // const shapeFlag = isString(type)
  //   ? ShapeFlags.ELEMENT
  //   : __FEATURE_SUSPENSE__ && isSuspense(type)
  //   ? ShapeFlags.SUSPENSE
  //   : isTeleport(type)
  //   ? ShapeFlags.TELEPORT
  //   : isObject(type)
  //   ? ShapeFlags.STATEFUL_COMPONENT
  //   : isFunction(type)
  //   ? ShapeFlags.FUNCTIONAL_COMPONENT
  //   : 0;

  // if (__DEV__ && shapeFlag & ShapeFlags.STATEFUL_COMPONENT && isProxy(type)) {
  //   type = toRaw(type);
  //   warn(
  //     `Vue received a Component which was made a reactive object. This can ` +
  //       `lead to unnecessary performance overhead, and should be avoided by ` +
  //       `marking the component with \`markRaw\` or using \`shallowRef\` ` +
  //       `instead of \`ref\`.`,
  //     `\nComponent that was made reactive: `,
  //     type,
  //   );
  // }

  return createBaseVNode(type, props, children, patchFlag, dynamicProps, 0, isBlockNode, true);
}

export function normalizeVNode(child: VNodeChild): VNode {
  if (child == null || typeof child === 'boolean') {
    // empty placeholder
    return createVNode(Comment);
  } else if (isArray(child)) {
    // fragment
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice(),
    );
  } else if (typeof child === 'object') {
    // already vnode, this should be the most common since compiled templates
    // always produce all-vnode children arrays
    return cloneIfMounted(child);
  } else {
    // strings and numbers
    return createVNode(Text, null, String(child));
  }
}
function deepCloneVNode(vnode: VNode): VNode {
  const cloned = cloneVNode(vnode);
  if (isArray(vnode.children)) {
    cloned.children = (vnode.children as VNode[]).map(deepCloneVNode);
  }
  return cloned;
}
export function mergeProps(...args: (Data & VNodeProps)[]) {
  const ret: Data = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === 'class') {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === 'style') {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.indexOf(incoming) !== -1)) {
          ret[key] = existing ? [].concat(existing as any, incoming as any) : incoming;
        }
      } else if (key !== '') {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}

export function cloneVNode<T, U>(
  vnode: VNode<T, U>,
  extraProps?: (Data & VNodeProps) | null,
  mergeRef = false,
): VNode<T, U> {
  // This is intentionally NOT using spread or extend to avoid the runtime
  // key enumeration cost.
  const { props, patchFlag, children } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned: VNode<T, U> = {
    __v_isVNode: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    // ref:
    //   extraProps && extraProps.ref
    //     ? // #2078 in the case of <component :is="vnode" ref="extra"/>
    //       // if the vnode itself already has a ref, cloneVNode will need to merge
    //       // the refs so the single vnode can be set on multiple refs
    //       mergeRef && ref
    //       ? isArray(ref)
    //         ? ref.concat(normalizeRef(extraProps)!)
    //         : [ref, normalizeRef(extraProps)!]
    //       : normalizeRef(extraProps)
    //     : ref,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children: children,
    target: vnode.target,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag:
      extraProps && vnode.type !== Fragment
        ? patchFlag === -1 // hoisted node
          ? PatchFlags.FULL_PROPS
          : patchFlag | PatchFlags.FULL_PROPS
        : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,

    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce,
  };
  return cloned as any;
}

// optimized normalization for template-compiled render fns
export function cloneIfMounted(child: VNode): any {
  return (child.el === null && child.patchFlag !== PatchFlags.HOISTED) || (child as any).memo
    ? child
    : cloneVNode(child as any);
}
