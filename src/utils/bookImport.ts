export interface BookImportDraft {
  title: string;
  author: string;
  coverUrl: string;
  coverFile: File | null;
  status: 'want_to_read';
  type: 'book';
  sourceKind: 'pdf' | 'image';
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, '');
}

function normalizeSeparators(value: string) {
  return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getTitleFromFileName(fileName: string) {
  const rawBaseName = stripExtension(fileName.trim());
  const titlePart = rawBaseName.split(/\s+-\s+/)[0] ?? rawBaseName;
  return normalizeSeparators(titlePart).replace(/\s+(cover|front)$/i, '');
}

export function getAuthorFromFileName(fileName: string) {
  const rawBaseName = stripExtension(fileName.trim());
  const parts = rawBaseName.split(/\s+-\s+/);
  return normalizeSeparators(parts[1] ?? '');
}

async function readFileAsDataUrl(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:${file.type};base64,${btoa(binary)}`;
}

export async function buildBookDraftFromFile(file: File): Promise<BookImportDraft> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isImage && !isPdf) {
    throw new Error('Unsupported source file');
  }

  return {
    title: getTitleFromFileName(file.name),
    author: getAuthorFromFileName(file.name),
    coverUrl: isImage ? await readFileAsDataUrl(file) : '',
    coverFile: isImage ? file : null,
    status: 'want_to_read',
    type: 'book',
    sourceKind: isImage ? 'image' : 'pdf'
  };
}
