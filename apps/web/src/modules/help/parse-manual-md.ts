export type ManualBlock =
  | { type: 'title'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'hr' };

/** Strip common inline markdown for plain-text PDF output */
export function stripInlineMd(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

/**
 * Parse the user manual markdown (headings, paragraphs, bullets, ---) into blocks for @react-pdf.
 */
export function parseManualMd(markdown: string): ManualBlock[] {
  const lines = markdown.split('\n');
  const blocks: ManualBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trim = raw.trim();

    if (trim === '') {
      i += 1;
      continue;
    }

    if (trim === '---') {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    if (trim.startsWith('# ') && !trim.startsWith('## ')) {
      blocks.push({ type: 'title', text: stripInlineMd(trim.slice(2).trim()) });
      i += 1;
      continue;
    }

    if (trim.startsWith('## ') && !trim.startsWith('### ')) {
      blocks.push({ type: 'h2', text: stripInlineMd(trim.slice(3).trim()) });
      i += 1;
      continue;
    }

    if (trim.startsWith('### ')) {
      blocks.push({ type: 'h3', text: stripInlineMd(trim.slice(4).trim()) });
      i += 1;
      continue;
    }

    if (trim.startsWith('- ') || trim.startsWith('* ')) {
      blocks.push({ type: 'bullet', text: stripInlineMd(trim.slice(2).trim()) });
      i += 1;
      continue;
    }

    const para: string[] = [trim];
    i += 1;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === '') break;
      if (t === '---') break;
      if (t.startsWith('#')) break;
      if (t.startsWith('- ') || t.startsWith('* ')) break;
      para.push(t);
      i += 1;
    }
    const text = stripInlineMd(para.join(' '));
    if (text) {
      blocks.push({ type: 'p', text });
    }
  }

  return blocks;
}
