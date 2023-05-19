// 一开始没有获取fontSize的时候需要自己算一下比例
export function getScaleByDom() {
  const fontDom = document.createElement('div');
  fontDom.style.fontSize = '16px';
  document.body.appendChild(fontDom);
  const originFontSize = parseFloat(fontDom.style.fontSize); // 默认字体大小是16px
  const realFontSize = parseFloat(
    window.getComputedStyle(fontDom, null).getPropertyValue('font-size')
  );
  document.body.removeChild(fontDom);
  const percent = realFontSize / originFontSize;
  return percent;
}
