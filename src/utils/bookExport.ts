import type { Book } from '../data/books';
import type { Note } from '../data/notes';

export interface ShareImageCard {
  id: string;
  title: string;
  author: string;
  status: Book['status'];
  notePreview: string;
}

export interface ShareImageLayout {
  width: number;
  padding: number;
  titleHeight: number;
  cardGap: number;
  cardHeight: number;
  footerHeight: number;
  totalHeight: number;
  cards: ShareImageCard[];
}

const STATUS_LABELS: Record<Book['status'], string> = {
  want_to_read: '想读',
  reading: '在读',
  read: '已读',
  shelved: '搁置'
};

export function buildBookExportRows(books: Book[], notesByBook: Record<string, Note[]>) {
  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    cover_url: book.cover_url,
    notes: notesByBook[book.id] ?? []
  }));
}

export function buildShareImageLayout(books: Book[], notesByBook: Record<string, Note[]>): ShareImageLayout {
  const width = 1200;
  const padding = 72;
  const titleHeight = 92;
  const cardGap = 32;
  const cardHeight = 300;
  const footerHeight = 56;
  const cards = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    status: book.status,
    notePreview: notesByBook[book.id]?.[0]?.content ?? '还没有笔记'
  }));
  const totalHeight = padding + titleHeight + (cards.length * cardHeight) + (Math.max(cards.length - 1, 0) * cardGap) + footerHeight + padding;

  return {
    width,
    padding,
    titleHeight,
    cardGap,
    cardHeight,
    footerHeight,
    totalHeight,
    cards
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(image);
    image.src = src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let current = '';

  for (const char of text) {
    const next = current + char;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export async function renderShareImageCanvas(books: Book[], notesByBook: Record<string, Note[]>) {
  const layout = buildShareImageLayout(books, notesByBook);
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas rendering is unavailable');

  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#2f3b33';
  ctx.font = 'bold 44px "Noto Serif SC", serif';
  ctx.fillText('拾光札记', layout.padding, layout.padding + 38);
  ctx.font = '24px "Noto Serif SC", serif';
  ctx.fillStyle = '#6b756d';
  ctx.fillText(`共 ${books.length} 本书`, layout.padding, layout.padding + 76);

  let y = layout.padding + layout.titleHeight;
  for (const book of books) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(layout.padding, y, layout.width - layout.padding * 2, layout.cardHeight);

    const coverSize = 190;
    const coverX = layout.padding + 24;
    const coverY = y + 24;
    if (book.cover_url) {
      const image = await loadImage(book.cover_url);
      if (image.naturalWidth > 0) {
        ctx.drawImage(image, coverX, coverY, coverSize, coverSize);
      } else {
        ctx.fillStyle = '#dfe8df';
        ctx.fillRect(coverX, coverY, coverSize, coverSize);
      }
    } else {
      ctx.fillStyle = '#dfe8df';
      ctx.fillRect(coverX, coverY, coverSize, coverSize);
    }

    const textX = coverX + coverSize + 28;
    ctx.fillStyle = '#263129';
    ctx.font = 'bold 34px "Noto Serif SC", serif';
    ctx.fillText(book.title, textX, y + 60);
    ctx.fillStyle = '#69756e';
    ctx.font = '24px "Noto Serif SC", serif';
    ctx.fillText(book.author || '作者未填', textX, y + 98);

    ctx.fillStyle = '#edf5ed';
    ctx.fillRect(textX, y + 122, 110, 42);
    ctx.fillStyle = '#4b6a52';
    ctx.font = '22px "Noto Serif SC", serif';
    ctx.fillText(STATUS_LABELS[book.status], textX + 22, y + 150);

    ctx.fillStyle = '#4b554f';
    ctx.font = '24px "Noto Serif SC", serif';
    const preview = notesByBook[book.id]?.[0]?.content ?? '还没有笔记';
    wrapText(ctx, preview, 760).slice(0, 3).forEach((line, index) => {
      ctx.fillText(line, textX, y + 205 + index * 34);
    });

    y += layout.cardHeight + layout.cardGap;
  }

  ctx.fillStyle = '#7b847d';
  ctx.font = '20px "Noto Serif SC", serif';
  ctx.fillText(`导出于 ${new Date().toLocaleDateString('zh-CN')}`, layout.padding, layout.totalHeight - layout.padding + 8);

  return canvas;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadBooksAsShareImage(books: Book[], notesByBook: Record<string, Note[]>) {
  const canvas = await renderShareImageCanvas(books, notesByBook);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Image export failed'));
    }, 'image/png');
  });
  triggerDownload(blob, `books_share_${new Date().toISOString().slice(0, 10)}.png`);
}

export async function downloadBooksAsPdf(books: Book[], notesByBook: Record<string, Note[]>) {
  const canvas = await renderShareImageCanvas(books, notesByBook);
  const dataUrl = canvas.toDataURL('image/png');
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  const image = await pdf.embedPng(dataUrl);
  const page = pdf.addPage([canvas.width, canvas.height]);
  page.drawImage(image, { x: 0, y: 0, width: canvas.width, height: canvas.height });
  const pdfBytes = await pdf.save();
  const pdfBuffer = new Uint8Array(pdfBytes).buffer;
  triggerDownload(new Blob([pdfBuffer], { type: 'application/pdf' }), `books_export_${new Date().toISOString().slice(0, 10)}.pdf`);
}
