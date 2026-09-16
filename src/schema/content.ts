import { z } from 'zod';

const text = z.string().min(1).refine(v => v.trim().length > 0, 'Must not be blank');
const inline = text.refine(v => !/[\r\n\t]/.test(v), 'Use semantic paragraphs, not embedded line breaks');
const highlight = inline.refine(v => v === v.trim(), 'Highlight must not include outer spaces');
const paragraphs = z.array(inline).min(1);
const lines = z.array(inline).min(1);

export const bodySchema = z.object({
  number: z.number().int().positive(), title: inline, highlight,
  paragraphs, keySentence: inline,
  // Optional editorial phrase boundaries, never inserted mechanically by the renderer.
  paragraphLines: z.array(lines).optional(), keySentenceLines: lines.optional(),
}).strict();

export const contentSchema = z.object({
  category: z.enum(['business', 'money', 'insight']),
  slug: z.string().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a safe lowercase kebab-case slug')
    .refine(v => !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(v), 'Reserved Windows filename'),
  cover: z.object({ brand: z.literal('URINSIGHT'), titleLines: z.tuple([inline, inline, inline]), highlight, image: text.optional() }).strict(),
  body: z.array(bodySchema).min(5).max(7),
  summary: z.object({ label: z.literal('SUMMARY'), headline: inline, highlight, paragraphs, keySentence: inline,
    headlineLines: lines.optional(), paragraphLines: z.array(lines).optional(), keySentenceHighlight: highlight.optional(),
  }).strict(),
  insight: z.object({ headline: inline, highlight, headlineLines: lines.optional() }).strict(),
}).strict().superRefine((data, ctx) => {
  const fail = (path: (string | number)[], message: string) => ctx.addIssue({ code: 'custom', path, message });
  const target = (sentence: string, phrase: string, path: (string | number)[]) => {
    if (!sentence.includes(phrase)) fail(path, 'Highlight target does not exist in the sentence');
    else if (sentence.split(phrase).length !== 2) fail(path, 'Highlight must identify exactly one occurrence');
  };
  const same = (sentence: string, values: string[] | undefined, path: (string | number)[]) => {
    if (values && values.join(' ') !== sentence) fail(path, 'Editorial lines must reproduce the original sentence when joined with spaces');
  };
  const checkParagraphs = (page: { paragraphs: string[]; paragraphLines?: string[][] }, path: (string | number)[]) => {
    if (page.paragraphLines) {
      if (page.paragraphLines.length !== page.paragraphs.length) fail(path, 'One line group per semantic paragraph is required');
      page.paragraphs.forEach((p, i) => same(p, page.paragraphLines?.[i], [...path, i]));
    }
  };
  target(data.cover.titleLines.join(' '), data.cover.highlight, ['cover', 'highlight']);
  if (!data.cover.titleLines.some(line => line.includes(data.cover.highlight))) fail(['cover', 'highlight'], 'Highlight cannot cross title lines');
  data.body.forEach((p, i) => {
    if (p.number !== i + 1) fail(['body', i, 'number'], 'Body numbers must be sequential starting at 1 (not page numbers)');
    target(p.title, p.highlight, ['body', i, 'highlight']);
    checkParagraphs(p, ['body', i, 'paragraphLines']);
    same(p.keySentence, p.keySentenceLines, ['body', i, 'keySentenceLines']);
  });
  for (const name of ['summary', 'insight'] as const) {
    const p = data[name];
    target(p.headline, p.highlight, [name, 'highlight']);
    same(p.headline, p.headlineLines, [name, 'headlineLines']);
    if (p.headlineLines && !p.headlineLines.some(l => l.includes(p.highlight))) fail([name, 'headlineLines'], 'Highlight cannot cross editorial lines');
  }
  checkParagraphs(data.summary, ['summary', 'paragraphLines']);
  if (data.summary.keySentenceHighlight) target(data.summary.keySentence, data.summary.keySentenceHighlight, ['summary', 'keySentenceHighlight']);
});

export type CarouselContent = z.infer<typeof contentSchema>;
