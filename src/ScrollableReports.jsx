import React, {useLayoutEffect, useRef, useState} from 'react';

export default function ScrollableReports({status, count, children}) {
  const viewport = useRef(null);
  const list = useRef(null);
  const rail = useRef(null);
  const grabOffset = useRef(0);
  const [scroll, setScroll] = useState({top: 0, max: 0, ratio: 1});
  const [threeCardHeight, setThreeCardHeight] = useState(750);
  const regionId = `${status}-reports`;

  function syncScroll() {
    const element = viewport.current;
    setScroll({top: element.scrollTop, max: Math.max(0, element.scrollHeight - element.clientHeight),
      ratio: element.scrollHeight ? element.clientHeight / element.scrollHeight : 1});
  }

  useLayoutEffect(() => {
    const element = viewport.current;
    function measure() {
      const cards = [...list.current.children].slice(0, 3);
      const style = getComputedStyle(list.current);
      const height = cards.reduce((total, card) => total + card.getBoundingClientRect().height, 0)
        + Math.max(0, cards.length - 1) * parseFloat(style.gap)
        + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      setThreeCardHeight(height);
      syncScroll();
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(list.current);
    [...list.current.children].forEach(card => observer.observe(card));
    measure();
    return () => observer.disconnect();
  }, [children]);

  function movePointer(event) {
    const bounds = rail.current.getBoundingClientRect();
    const thumbHeight = Math.max(28, bounds.height * scroll.ratio);
    const travel = bounds.height - thumbHeight;
    if (travel > 0) viewport.current.scrollTop = Math.max(0, Math.min(1,
      (event.clientY - bounds.top - grabOffset.current) / travel)) * scroll.max;
  }

  function startDrag(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    const thumb = event.currentTarget.firstElementChild;
    grabOffset.current = event.target === thumb ? event.clientY - thumb.getBoundingClientRect().top
      : thumb.getBoundingClientRect().height / 2;
    event.currentTarget.setPointerCapture(event.pointerId);
    movePointer(event);
  }

  function scrollWithKeys(event) {
    const element = viewport.current;
    const destinations = {ArrowDown: element.scrollTop + 48, ArrowUp: element.scrollTop - 48,
      PageDown: element.scrollTop + element.clientHeight, PageUp: element.scrollTop - element.clientHeight,
      Home: 0, End: scroll.max};
    if (event.key in destinations) {
      event.preventDefault();
      element.scrollTop = destinations[event.key];
    }
  }

  const overflowing = scroll.max > 1;
  const thumbHeight = `max(28px, ${scroll.ratio * 100}%)`;
  const progress = scroll.max ? scroll.top / scroll.max : 0;

  return <div className="column-panel" style={{'--three-card-height': `${threeCardHeight}px`}}>
    <div className={`scroll-frame${overflowing ? ' has-overflow' : ''}`}>
      {overflowing && <div ref={rail} className="scroll-rail" role="scrollbar" tabIndex={0}
        aria-label={`Scroll ${status} reports`} aria-controls={regionId} aria-orientation="vertical"
        aria-valuemin={0} aria-valuemax={Math.round(scroll.max)} aria-valuenow={Math.round(scroll.top)}
        onKeyDown={scrollWithKeys} onPointerDown={startDrag}
        onPointerMove={event => {if (event.currentTarget.hasPointerCapture(event.pointerId)) movePointer(event);}}
        onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)}>
        <span className="scroll-thumb" style={{height: thumbHeight,
          top: `calc((100% - ${thumbHeight}) * ${progress})`}} />
      </div>}
      <div ref={viewport} id={regionId} className="report-scroll" role="region"
        aria-label={`${status.charAt(0).toUpperCase() + status.slice(1)} reports`}
        aria-describedby={overflowing ? `${regionId}-hint` : undefined}
        tabIndex={overflowing ? 0 : undefined} onScroll={syncScroll}>
        <div ref={list} className="sticky-list">{children}</div>
      </div>
    </div>
    {overflowing && <p className="scroll-hint" id={`${regionId}-hint`}>
      <span>{count} notices</span><span>{scroll.top >= scroll.max - 1 ? 'End of list · Scroll up ↑' : 'Scroll for more ↓'}</span>
    </p>}
  </div>;
}
