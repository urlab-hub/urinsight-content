import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { tokens as t, designTokens, coverOverlay } from '../config/tokens.js';
import type { CarouselContent } from '../schema/content.js';

export function Highlight({ text, target }: { text: string; target?: string }) {
  if (!target || !text.includes(target)) return <>{text}</>;
  const index = text.indexOf(target);
  return <>{text.slice(0, index)}<mark data-highlight>{target}</mark>{text.slice(index + target.length)}</>;
}
function EditorialText({ text, lines, target }: { text: string; lines?: string[]; target?: string }) {
  return lines ? <>{lines.map((line, i) => <span className="editorial-line" data-check key={i}><Highlight text={line} target={target}/></span>)}</> : <Highlight text={text} target={target}/>;
}
function Paragraphs({ paragraphs, lines }: { paragraphs: string[]; lines?: string[][] }) {
  return <>{paragraphs.map((text, i) => <p data-check key={i}><EditorialText text={text} lines={lines?.[i]}/></p>)}</>;
}
export type Slide = { kind: 'cover' } | { kind: 'body'; index: number } | { kind: 'summary' } | { kind: 'insight' };
export type InsightImage = { kind: 'provided' | 'cover-fallback'; dataUrl: string } | { kind: 'placeholder-fallback' };
export type ContentLayout = 'legacy' | 'anchored';
export function slidesFor(content: CarouselContent): Slide[] {
  return [{ kind: 'cover' }, ...content.body.map((_, index) => ({ kind: 'body' as const, index })), { kind: 'summary' }, { kind: 'insight' }];
}
function SlideContent({ content: c, slide, image, insightImage, operating }: { content: CarouselContent; slide: Slide; image?: string; insightImage?: InsightImage; operating: boolean }) {
  switch (slide.kind) {
    case 'cover': return <>
      {image && <img className="cover-image" src={image} alt=""/>}
      {image && operating && <div className="cover-overlay" aria-hidden="true"/>}
      <div className="cover-brand" data-check>{c.cover.brand}</div>
      <h1 className="cover-title" data-check>{c.cover.titleLines.map((line, i) => <span className="cover-line" data-check data-single-line key={i}><Highlight text={line} target={c.cover.highlight}/></span>)}</h1>
      <div className="category" data-check>#{t.categories[c.category].label}</div><div className="cover-footer" data-check>{t.footer}</div>
    </>;
    case 'body': { const p = c.body[slide.index]; return <>
      <div className="body-brand" data-check>{t.brand}</div>
      <h2 className="body-title" data-check data-single-line><span className="body-number">{p.number}. </span><Highlight text={p.title} target={p.highlight}/></h2>
      <div className="body-copy copy" data-check><Paragraphs paragraphs={p.paragraphs} lines={p.paragraphLines}/><p className="key" data-check><EditorialText text={p.keySentence} lines={p.keySentenceLines}/></p></div>
    </>; }
    case 'summary': return <>
      <div className="summary-label" data-check>{c.summary.label}</div>
      <h2 className="summary-title" data-check><EditorialText text={c.summary.headline} lines={c.summary.headlineLines} target={c.summary.highlight}/></h2>
      <div className="summary-copy copy" data-check><Paragraphs paragraphs={c.summary.paragraphs} lines={c.summary.paragraphLines}/><p className="summary-key" data-check><Highlight text={c.summary.keySentence} target={c.summary.keySentenceHighlight ?? c.summary.keySentence}/></p></div>
    </>;
    case 'insight': return <>
      {insightImage && <div className="insight-visual" data-insight-mode={insightImage.kind}>
        {insightImage.kind !== 'placeholder-fallback' && <><img className={`insight-image ${insightImage.kind}`} src={insightImage.dataUrl} alt=""/><div className="insight-overlay"/></>}
      </div>}
      <div className="insight-label" data-check>{t.brand}</div>
      <h2 className="insight-title" data-check><EditorialText text={c.insight.headline} lines={c.insight.headlineLines} target={c.insight.highlight}/></h2>
      <footer className="insight-footer" data-check><div className="slogan" data-check>{t.slogan}</div><div className="footer-brand" data-check>{t.brand}</div></footer>
    </>;
  }
}
export function renderHtml(content: CarouselContent, slide: Slide, fontBase64: string, image?: string, insightImage?: InsightImage, contentLayout: ContentLayout = 'legacy'): string {
  const t = designTokens(contentLayout === 'anchored');
  const css = `
    @font-face{font-family:Pretendard;src:url(data:font/woff2;base64,${fontBase64}) format('woff2');font-style:normal;font-weight:100 900;font-display:block}
    *{box-sizing:border-box}html,body{margin:0;width:${t.canvas.width}px;height:${t.canvas.height}px}body{font-family:${t.font.family};font-weight:${t.font.regular};font-synthesis:none;-webkit-font-smoothing:antialiased}
    .slide{position:relative;width:${t.canvas.width}px;height:${t.canvas.height}px;background:${t.colors.paper};color:${t.colors.ink};--accent:${t.categories[content.category].color};--title-body-gap:${t.content.titleToBodyGap};--key-line:${t.body.keyLine};--key-gap:${slide.kind === 'summary' ? t.summary.keyGap : t.body.keyGap}}
    h1,h2,p{margin:0}h1,h2,.key,.summary-key,.slogan{font-weight:${t.font.bold}}
    mark{position:relative;background:transparent;color:white;padding:0;white-space:nowrap;isolation:isolate;--highlight-pad-left:${t.highlight.horizontal.left}px;--highlight-pad-right:${t.highlight.horizontal.right}px;--highlight-ink-gap:${t.highlight.horizontal.inkGap}px}
    mark::before{content:'';position:absolute;left:calc(var(--ink-left,0px) - var(--highlight-left,0px));top:calc(var(--ink-top,0px) - var(--highlight-top,0px));width:calc(var(--ink-width,100%) + var(--highlight-left,0px) + var(--highlight-right,0px));height:calc(var(--ink-height,100%) + var(--highlight-top,0px) + var(--highlight-bottom,0px));background:var(--accent);z-index:-1}
    .cover{--highlight-top:${t.highlight.cover.top}px;--highlight-bottom:${t.highlight.cover.bottom}px}.body{--highlight-top:${t.highlight.body.top}px;--highlight-bottom:${t.highlight.body.bottom}px}.summary{--highlight-top:${t.highlight.summary.top}px;--highlight-bottom:${t.highlight.summary.bottom}px}.summary-key{--highlight-top:${t.highlight.summaryKey.top}px;--highlight-bottom:${t.highlight.summaryKey.bottom}px}.insight{--highlight-top:${t.highlight.insight.top}px;--highlight-bottom:${t.highlight.insight.bottom}px}
    .editorial-line,.cover-line{display:block}
    .cover{background:${t.colors.placeholder};color:white}.cover-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .cover-overlay{position:absolute;inset:0;pointer-events:none;background:rgba(0,0,0,${coverOverlay.opacity})}
    .cover-brand,.cover-title,.category,.cover-footer,.body-title,.body-copy,.summary-label,.summary-title,.summary-copy,.insight-label,.insight-title,.insight-footer{position:absolute;left:${t.layout.left}px;width:${t.layout.width}px}
    .cover-brand{top:${t.cover.brandTop}px;font-size:${t.cover.brandSize}px}
    .cover-title{top:${t.cover.titleTop}px;width:${t.cover.titleWidth}px;font-size:${t.cover.titleSize}px;line-height:${t.cover.titleLine}px}.cover-line{white-space:nowrap}
    .category{top:${t.cover.categoryTop}px;font-size:${t.cover.categorySize}px;letter-spacing:${t.cover.categoryLetterSpacing}px;font-weight:700;color:var(--accent)}.cover-footer{top:${t.cover.footerTop}px;font-size:${t.cover.footerSize}px}
    .body-brand{position:absolute;right:${t.layout.right}px;top:${t.body.brandTop}px;font-size:${t.body.brandSize}px;color:var(--accent);font-weight:400}
    .body-title{top:${t.body.titleTop}px;font-size:${t.body.titleSize}px;line-height:${t.body.titleLine}px;letter-spacing:${t.body.titleLetterSpacing}px;white-space:nowrap}
    .body-number{display:inline-block;width:${t.body.numberWidth}px;letter-spacing:0}
    .copy{font-size:${t.body.textSize}px;line-height:${t.body.textLine}px;color:${t.colors.body};word-break:keep-all;overflow-wrap:normal}
    .body-copy{top:${t.body.textTop}px}.copy p+p{margin-top:${t.body.paragraphGap}px}.copy .key{margin-top:${t.body.keyGap}px;font-size:${t.body.keySize}px;line-height:${t.body.keyLine}px;color:var(--accent)}
    .summary-label{top:${t.summary.labelTop}px;font-size:${t.summary.labelSize}px;letter-spacing:${t.summary.labelLetterSpacing}px;font-weight:700;color:var(--accent)}
    .summary-title{top:${t.summary.titleTop}px;font-size:${t.summary.titleSize}px;line-height:${t.summary.titleLine}px;word-break:keep-all}
    .summary-copy{top:${t.summary.textTop}px}.copy .summary-key{margin-top:${t.summary.keyGap}px;font-size:${t.summary.keySize}px;line-height:${t.body.keyLine}px;color:${t.colors.ink}}
    .insight{background:${t.colors.dark};color:white}.insight-label{top:${t.insight.labelTop}px;font-size:${t.insight.labelSize}px;color:var(--accent)}
    .insight-title{top:${t.insight.titleTop}px;font-size:${t.insight.titleSize}px;line-height:${t.insight.titleLine}px;word-break:keep-all}
    .insight-footer{top:${t.insight.footerTop}px}.slogan{font-size:${t.insight.sloganSize}px;color:${t.colors.muted}}.footer-brand{font-size:${t.insight.brandSize}px;margin-top:${t.insight.brandGap}px}
    .insight-visual{position:absolute;inset:0;overflow:hidden;pointer-events:none;background:${t.colors.dark}}
    .insight-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${t.insightImage.position}}
    .insight-image.cover-fallback{object-position:${t.insightImage.fallbackPosition};transform:scale(${t.insightImage.fallbackScale})}
    .insight-overlay{position:absolute;inset:0;background:rgba(0,0,0,${t.insightImage.overlayOpacity})}
    .anchored .summary-label{top:${t.insight.labelTop}px}
    .anchored .body-copy{top:${t.body.titleTop + t.body.titleLine + t.content.titleToBodyGap}px;height:${t.content.emphasisBottomY - t.body.textTop}px}
    .anchored .summary-copy{top:auto;bottom:${t.canvas.height - t.content.emphasisBottomY}px;height:auto}
    .anchored .copy>.key,.anchored .copy>.summary-key{position:absolute;bottom:0;left:0;width:100%;margin-top:0}
  `;
  const anchored = contentLayout === 'anchored' && (slide.kind === 'body' || slide.kind === 'summary');
  return '<!doctype html>' + renderToStaticMarkup(<html lang="ko"><head><meta charSet="utf-8"/><title>{content.slug}</title><style>{css}</style></head><body><main className={`slide ${slide.kind}${anchored ? ' anchored' : ''}`} data-page={anchored ? (slide.kind === 'body' ? slide.index + 2 : content.body.length + 2) : undefined}><SlideContent content={content} slide={slide} image={image} insightImage={insightImage} operating={contentLayout === 'anchored'}/></main></body></html>);
}
