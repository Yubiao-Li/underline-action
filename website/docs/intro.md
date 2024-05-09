---
sidebar_position: 1
---

## 参差不齐的划线
```jsx live
function Clock(props) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.innerHTML = `<p style="margin: 10px 5px;display: block;line-height: 1.75em;"><span style="font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);"><span style="font-family: &quot;Courier New&quot;;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__19">-</span><span style="font-family: KaiTi;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__20">根据上清所数据，境外机构</span><span style="font-family: &quot;Courier New&quot;;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__21">3</span><span style="font-family: KaiTi;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__22">月增持的同业存单约</span><span style="font-family: &quot;Courier New&quot;;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__23">1187.7</span><span style="font-family: KaiTi;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__24">亿元，则为</span><span style="font-family: &quot;Courier New&quot;;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__25">2014</span><span style="font-family: KaiTi;font-size: 17px;letter-spacing: 1px;color: rgb(127, 127, 127);" class="js_darkmode__text__26">年有数据以来的最大单月增持幅度。</span></span></p>`
    const underlineAction = UnderlineAction({
      selector: ref.current,
    })
    const spans = underlineAction.insertSpanInRange(
      0,
      40,
      {
        className: 'underline',
      },
      true
    );
  }, []);

  return <div ref={ref}></div>;
}
```
