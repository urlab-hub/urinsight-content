import type { Page } from 'playwright';
import { tokens } from '../config/tokens.js';

/** Browser-side ink metrics also avoid highlighting the font's ascent/descent whitespace. */
export async function prepareAndValidate(page: Page) {
  return page.evaluate(async ({ width, height, frame }) => {
    await document.fonts.ready;
    if (![...document.fonts].some(face => face.family === 'Pretendard' && face.status === 'loaded') || !document.fonts.check('700 40px Pretendard', '정보 판단')) throw new Error('Pretendard did not load');
    await Promise.all([...document.images].map(img => img.decode()));
    const slideStyle = getComputedStyle(document.querySelector('.slide')!);
    const titleGap = Number(slideStyle.getPropertyValue('--title-body-gap'));
    const keyLine = Number(slideStyle.getPropertyValue('--key-line'));
    const keyGap = Number(slideStyle.getPropertyValue('--key-gap'));
    // Measure after font loading and before ink/highlight preparation. Legacy is untouched.
    const summary = document.querySelector<HTMLElement>('.anchored.summary');
    if (summary) {
      const bottom = summary.querySelector('h2')!.getBoundingClientRect().bottom;
      summary.querySelector<HTMLElement>('.summary-copy')!.style.top = `${bottom + titleGap}px`;
    }
    const context = document.createElement('canvas').getContext('2d')!;
    const errors: string[] = [];
    const walker = document.createTreeWalker(document.querySelector('.slide')!, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode())) if (node.textContent?.length) textNodes.push(node as Text);
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
      const inkLeft = r.left - metric.actualBoundingBoxLeft;
      const inkRight = r.left + metric.actualBoundingBoxRight;
      let leftLimit: number = 0, rightLimit: number = width;
      const first = textNodes.findIndex(n => el.contains(n));
      let last = first;
      while (last + 1 < textNodes.length && el.contains(textNodes[last + 1])) last++;
      for (const direction of [-1, 1]) {
        const neighbor = textNodes[direction < 0 ? first - 1 : last + 1];
        if (!neighbor) continue;
        const chars = [...neighbor.data];
        const char = direction < 0 ? chars[chars.length - 1] : chars[0];
        const range = document.createRange();
        const offset = direction < 0 ? neighbor.length - char.length : 0;
        range.setStart(neighbor, offset); range.setEnd(neighbor, offset + char.length);
        const boxes = [...range.getClientRects()];
        const box = direction < 0 ? boxes[boxes.length - 1] : boxes[0];
        if (!box || box.bottom <= r.top || box.top >= r.bottom) continue;
        // Literal whitespace keeps its full advance unpainted. For adjoining letters,
        // stop one pixel before their ink, allowing optical room without overpainting.
        let edge = direction < 0 ? box.right : box.left;
        if (!/\s/u.test(char)) {
          const adjacent = getComputedStyle(neighbor.parentElement!);
          context.font = `${adjacent.fontWeight} ${adjacent.fontSize} ${adjacent.fontFamily}`;
          context.letterSpacing = adjacent.letterSpacing === 'normal' ? '0px' : adjacent.letterSpacing;
          const ink = context.measureText(char);
          const gap = parseFloat(style.getPropertyValue('--highlight-ink-gap')) || 0;
          edge = direction < 0 ? box.left + ink.actualBoundingBoxRight + gap : box.left - ink.actualBoundingBoxLeft - gap;
        }
        if (direction < 0) leftLimit = Math.max(leftLimit, edge);
        else rightLimit = Math.min(rightLimit, edge);
      }
      const left = Math.max(0, Math.min(parseFloat(style.getPropertyValue('--highlight-pad-left')) || 0, inkLeft - leftLimit));
      const right = Math.max(0, Math.min(parseFloat(style.getPropertyValue('--highlight-pad-right')) || 0, rightLimit - inkRight));
      el.style.setProperty('--highlight-left', `${left}px`);
      el.style.setProperty('--highlight-right', `${right}px`);
      const background = getComputedStyle(el, '::before');
      const bgLeft = r.left + parseFloat(background.left), bgTop = r.top + parseFloat(background.top);
      if (bgLeft < 0 || bgLeft + parseFloat(background.width) > width + .5 || bgTop < 0 || bgTop + parseFloat(background.height) > height + .5) errors.push('Highlight background outside canvas');
    }
    const slide = document.querySelector<HTMLElement>('.slide')!;
    const rect = slide.getBoundingClientRect();
    let contentFit;
    if (slide.classList.contains('anchored')) {
      const kind = slide.classList.contains('body') ? 'BODY' : 'SUMMARY';
      const copy = slide.querySelector<HTMLElement>('.copy')!;
      const key = copy.querySelector<HTMLElement>('.key,.summary-key')!;
      const title = slide.querySelector<HTMLElement>('h2')!;
      const paragraphs = [...copy.querySelectorAll<HTMLElement>(':scope > p:not(.key):not(.summary-key)')];
      const start = copy.getBoundingClientRect().top;
      const keyRect = key.getBoundingClientRect();
      const gap = keyGap;
      const currentHeight = Math.max(0, ...paragraphs.map(p => p.getBoundingClientRect().bottom - start));
      const allowedHeight = keyRect.top - gap - start;
      const titleRect = title.getBoundingClientRect();
      contentFit = { page: Number(slide.dataset.page), kind, contentStartY: start, titleToBodyGap: start - titleRect.bottom, currentHeight, allowedHeight, emphasisBottomY: keyRect.bottom, keyLines: keyRect.height / keyLine };
      if (currentHeight > allowedHeight + .5) errors.push(`${kind}_CONTENT_OVERFLOW page=${slide.dataset.page} region=paragraphs currentHeight=${currentHeight}px allowedHeight=${allowedHeight}px; Shorten/edit paragraphs; do not resize fonts or move anchors.`);
      if (titleRect.bottom > start) errors.push(`${kind}_CONTENT_OVERFLOW page=${slide.dataset.page} region=headline currentHeight=${titleRect.height}px allowedHeight=${start - titleRect.top}px; Shorten headline.`);
      const headlineLimit = frame.bottom - keyRect.height - gap - titleGap - titleRect.top;
      if (kind === 'SUMMARY' && titleRect.height > headlineLimit) errors.push(`SUMMARY_CONTENT_OVERFLOW page=${slide.dataset.page} region=headline currentHeight=${titleRect.height}px allowedHeight=${headlineLimit}px; Shorten headline.`);
      if (Math.abs(start - titleRect.bottom - titleGap) > .5) errors.push(`${kind}_CONTENT_OVERFLOW page=${slide.dataset.page} region=titleToBodyGap actual=${start - titleRect.bottom}px expected=${titleGap}px`);
      if (keyRect.height > keyLine * frame.maxKeyLines + .5) errors.push(`${kind}_CONTENT_OVERFLOW page=${slide.dataset.page} region=keySentence currentHeight=${keyRect.height}px allowedHeight=${keyLine * frame.maxKeyLines}px; Edit key sentence to 1–2 lines.`);
      if (Math.abs(keyRect.bottom - frame.bottom) > .5) errors.push(`${kind}_CONTENT_OVERFLOW page=${slide.dataset.page} region=keySentence bottom=${keyRect.bottom}px expectedBottom=${frame.bottom}px`);
    }
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
    return { canvas: { width, height }, checkedElements: elements.length, highlights: document.querySelectorAll('[data-highlight]').length, font: 'Pretendard', passed: true, ...(contentFit ? { contentFit } : {}) };
  }, { ...tokens.canvas, frame: { bottom: tokens.content.emphasisBottomY, maxKeyLines: tokens.content.maxKeyLines } });
}
