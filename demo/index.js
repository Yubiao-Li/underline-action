import { UnderlineAction } from '../src/lib/underlineAction.js';

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
});

underlineAction.mockUnderline(400, 550, {
  innerClass: 'underline'
}, document.body);
// underlineAction.mockUnderline(401, 550, {}, document.body);
// underlineAction.mockUnderline(402, 550, {}, document.body);
// underlineAction.mockUnderline(403, 550, {}, document.body);
