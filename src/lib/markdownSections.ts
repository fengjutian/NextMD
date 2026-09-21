export interface MarkdownSection {
  id: string;
  content: string;
}

/** Split Markdown at ATX headings without treating headings inside fenced code as boundaries. */
export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = markdown.match(/.*(?:\r?\n|$)/g)?.filter(Boolean) ?? [];
  const sections: MarkdownSection[] = [];
  const headingCounts = new Map<string, number>();
  let current: string[] = [];
  let currentId = 'preamble';
  let fence: string | null = null;

  const flush = () => {
    if (current.length) sections.push({ id: currentId, content: current.join('') });
  };

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!fence) fence = marker;
      else if (fence === marker) fence = null;
    }

    const heading = !fence ? line.match(/^(#{1,6})\s+(.+?)\s*#*\s*(?:\r?\n)?$/) : null;
    if (heading) {
      flush();
      current = [];
      const base = `${heading[1].length}:${heading[2].trim().toLocaleLowerCase()}`;
      const occurrence = (headingCounts.get(base) ?? 0) + 1;
      headingCounts.set(base, occurrence);
      currentId = `${base}:${occurrence}`;
    }
    current.push(line);
  }
  flush();
  return sections.length ? sections : [{ id: 'document', content: markdown }];
}
