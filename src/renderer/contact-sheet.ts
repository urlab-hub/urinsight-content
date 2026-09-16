import sharp from 'sharp';

export async function contactSheet(files: string[], target: string) {
  const cellWidth = 270, cellHeight = 338, gap = 30, columns = 4;
  const thumbs = await Promise.all(files.map(f => sharp(f).resize(cellWidth, cellHeight, { fit: 'fill' }).png().toBuffer()));
  await sharp({ create: { width: columns * cellWidth + (columns + 1) * gap, height: Math.ceil(files.length / columns) * (cellHeight + gap) + gap, channels: 3, background: '#ededed' } })
    .composite(thumbs.map((input, i) => ({ input, left: gap + (i % columns) * (cellWidth + gap), top: gap + Math.floor(i / columns) * (cellHeight + gap) }))).png().toFile(target);
}
