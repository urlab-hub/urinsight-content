import type { Page } from 'playwright';
import { tokens } from '../config/tokens.js';

/** Browser-side ink metrics also avoid highlighting the font's ascent/descent whitespace. */
export async function prepareAndValidate(page: Page) {
  return page.evaluate(async ({ width, height }) => {
    await document.fonts.ready;
    if (![...document.fonts].some(face => face.family === 'Pretendard' && face.status === 'loaded') || !document.fonts.check('700 40px Pretendard', '정보 판단')) throw new Error('Pretendard did not load');
    await Promise.all([...document.images].map(img => img.decode()));
    const context = document.createElement('canvas').getContext('2d')!;
    const errors: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-highlight]')) {
      const text = el.textContent!;
      if (text !== text.trim()) errors.push('Highlight contains outer spaces');
      const style = getComputedStyle(el);
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
      const metric = context.measureText(text);
      // A zero-size inline baseline probe locates the real baseline inside the inline box.
      const probe = document.createElement('span');
      probe.style.cssText = 'display:inline-block;width:0;height:0;padding:0;margin:0;vertical-align:baseline';
      el.append(probe);
      const r = el.getBoundingClientRect();
      const baseline = probe.getBoundingClientRect().top - r.top;
      probe.remove();
      el.style.setProperty('--ink-left', `${-metric.actualBoundingBoxLeft}px`);
      el.style.setProperty('--ink-top', `${baseline - metric.actualBoundingBoxAscent}px`);
      el.style.setProperty('--ink-width', `${metric.actualBoundingBoxLeft + metric.actualBoundingBoxRight}px`);
      el.style.setProperty('--ink-height', `${metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent}px`);
    }
    const slide = document.querySelector<HTMLElement>('.slide')!;
    const rect = slide.getBoundingClientRect();
    if (rect.width !== width || rect.height !== height) errors.push(`Canvas is ${rect.width}x${rect.height}`);
    const elements = [...document.querySelectorAll<HTMLElement>('[data-check]')];
    for (const el of elements) {
      const r = el.getBoundingClientRect();
      const name = `${el.className || el.tagName}: ${el.textContent?.slice(0, 45)}`;
      if (r.left < 0 || r.top < 0 || r.right > width + .5 || r.bottom > height + .5) errors.push(`Outside canvas: ${name}`);
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) errors.push(`Overflow: ${name}`);
      const range = document.createRange(); range.selectNodeContents(el);
      const boxes = [...range.getClientRects()].filter(x => x.width > 0);
      if (boxes.some(b => b.left < r.left - 1 || b.right > r.right + 1 || b.top < -1 || b.bottom > height + 1)) errors.push(`Text clipping: ${name}`);
      if (el.hasAttribute('data-single-line')) {
        const s = getComputedStyle(el);
        if (r.height > parseFloat(s.lineHeight) + 1 || boxes.some(b => Math.abs(b.top - boxes[0].top) > 2)) errors.push(`Title is not one line: ${name}`);
      }
    }
    // Top-level text regions must never collide (headline vs copy, footer vs headline, etc.).
    const regions = [...slide.children].filter((e): e is HTMLElement => e instanceof HTMLElement && e.hasAttribute('data-check'));
    for (let i = 0; i < regions.length; i++) for (let j = i + 1; j < regions.length; j++) {
      const a = regions[i].getBoundingClientRect(), b = regions[j].getBoundingClientRect();
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) errors.push(`Text regions overlap: ${regions[i].className} / ${regions[j].className}`);
    }
    if (document.documentElement.scrollWidth > width || document.documentElement.scrollHeight > height) errors.push('Document overflow');
    if (errors.length) throw new Error(errors.join('\n'));
    return { canvas: { width, height }, checkedElements: elements.length, highlights: document.querySelectorAll('[data-highlight]').length, font: 'Pretendard', passed: true };
  }, tokens.canvas);
}
