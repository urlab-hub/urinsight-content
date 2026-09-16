import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser } from '../src/renderer/browser.js';
import { renderHtml, slidesFor, type Slide } from '../src/renderer/template.js';
import { prepareAndValidate } from '../src/renderer/validate.js';
import { projectRoot } from '../src/renderer/render.js';
import { contentSchema } from '../src/schema/content.js';

test('optical highlight backgrounds preserve all text geometry, vertical insets and literal spaces', async () => {
  const sample = contentSchema.parse(JSON.parse(await readFile(path.join(projectRoot, 'content/sample-insight.json'), 'utf8')));
  const font = (await readFile(path.join(projectRoot, 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'))).toString('base64');
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await page.route('**/*', route => route.abort());
    const cases = slidesFor(sample).map(slide => ({ content: sample, slide, spaced: false }));
    for (const phrase of ['작은 사치', '재배치된다', '잘 고르는 힘', '판단', '더 좋은 기준']) {
      for (const spaced of [true, false]) {
        const content = structuredClone(sample);
        content.body[0].title = spaced ? `앞 ${phrase} 뒤` : `앞${phrase}뒤`;
        content.body[0].highlight = phrase;
        cases.push({ content, slide: { kind: 'body', index: 0 } as Slide, spaced });
      }
    }
    for (const { content, slide, spaced } of cases) {
      await page.setContent(renderHtml(content, slide, font));
      const zero = await page.addStyleTag({ content: 'mark{--highlight-pad-left:0px;--highlight-pad-right:0px}' });
      await prepareAndValidate(page);
      const before = await page.locator('[data-check],mark').evaluateAll(elements => elements.map(e => ({ text: e.textContent, rect: e.getBoundingClientRect().toJSON() })));
      const oldBackgrounds = await page.locator('mark').evaluateAll(elements => elements.map(e => ({ top: getComputedStyle(e, '::before').top, height: getComputedStyle(e, '::before').height })));
      await zero.evaluate(e => e.parentNode!.removeChild(e));
      await prepareAndValidate(page);
      assert.deepEqual(await page.locator('[data-check],mark').evaluateAll(elements => elements.map(e => ({ text: e.textContent, rect: e.getBoundingClientRect().toJSON() }))), before);
      assert.deepEqual(await page.locator('mark').evaluateAll(elements => elements.map(e => ({ top: getComputedStyle(e, '::before').top, height: getComputedStyle(e, '::before').height }))), oldBackgrounds);
      const padding = await page.locator('mark').evaluateAll(elements => elements.map(e => {
        const mark = e as HTMLElement, r = mark.getBoundingClientRect(), bg = getComputedStyle(mark, '::before');
        const inkStart = r.left + parseFloat(mark.style.getPropertyValue('--ink-left'));
        return { text: mark.textContent!, left: parseFloat(mark.style.getPropertyValue('--highlight-left')), right: parseFloat(mark.style.getPropertyValue('--highlight-right')), start: r.left + parseFloat(bg.left), end: r.left + parseFloat(bg.left) + parseFloat(bg.width), markLeft: r.left, markRight: r.right, inkStart, inkEnd: inkStart + parseFloat(mark.style.getPropertyValue('--ink-width')) };
      }));
      for (const p of padding) {
        assert.equal(p.text, p.text.trim());
        assert.ok(p.left >= 0 && p.left <= 5 && p.right >= 0 && p.right <= 7);
        // Existing glyph overhang can extend past its advance. Preserve that ink,
        // but never extend the new optical padding further into a literal space.
        if (spaced) { assert.ok(p.start >= Math.min(p.markLeft, p.inkStart) - .02); assert.ok(p.end <= Math.max(p.markRight, p.inkEnd) + .02, JSON.stringify(p)); }
      }
    }
  } finally { await browser.close(); }
});

