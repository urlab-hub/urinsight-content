/** Measured against the immutable v6 PNGs. All dimensions are CSS pixels. */
export const tokens = {
  canvas: { width: 1080, height: 1350 },
  colors: { ink: '#111111', body: '#252525', paper: '#ffffff', dark: '#111111', muted: '#cccccc', placeholder: '#171315' },
  categories: {
    business: { label: '사업', color: '#3B5BDB' },
    money: { label: '돈', color: '#1F8A5B' },
    insight: { label: '인사이트', color: '#FF5A36' },
  },
  font: { family: 'Pretendard', regular: 400, bold: 700 },
  layout: { left: 110, right: 110, width: 860 },
  // Ink-bound highlights: zero horizontal padding; vertical insets match v6 rectangles.
  highlight: { cover: { top: 2, bottom: 2 }, body: { top: 1, bottom: 3 }, summary: { top: 2, bottom: 3 }, summaryKey: { top: 3, bottom: 3 }, insight: { top: 2, bottom: 3 } },
  cover: { brandTop: 306, brandSize: 28.8, titleTop: 393, titleSize: 89, titleLine: 116, titleWidth: 875, categoryTop: 780, categorySize: 32.5, categoryLetterSpacing: -1.25, footerTop: 919, footerSize: 20.5 },
  body: { brandTop: 303, brandSize: 18.3, titleTop: 395, titleSize: 42, titleLine: 52, titleLetterSpacing: -0.4, numberWidth: 44, textTop: 504, textSize: 30.5, textLine: 47, paragraphGap: 26, keyGap: 31, keySize: 30.7, keyLine: 43 },
  summary: { labelTop: 304, labelSize: 26, labelLetterSpacing: -1.2, titleTop: 394, titleSize: 46.4, titleLine: 64, textTop: 689, keyGap: 37, keySize: 30.8 },
  insight: { labelTop: 255, labelSize: 27.6, titleTop: 344, titleSize: 63.5, titleLine: 88, footerTop: 899, sloganSize: 24.5, brandSize: 28.8, brandGap: 20 },
  brand: 'URINSIGHT',
  slogan: '돈, 사업, 성공을 더 깊게 읽는 시선',
  footer: 'MONEY · BUSINESS · SUCCESS',
} as const;
