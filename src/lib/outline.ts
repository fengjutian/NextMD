export interface OutlineHeading {
  level: number;
  text: string;
  offset: number;
}

export function getOutline(markdown: string): OutlineHeading[] {
  const headings: OutlineHeading[] = [];
  let offset = 0;
  let fence: { marker: string; length: number } | null = null;

  for (const line of markdown.split('\n')) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!fence) fence = { marker, length: fenceMatch[1].length };
      else if (marker === fence.marker && fenceMatch[1].length >= fence.length &&
        line.slice(fenceMatch[0].length).trim() === '') fence = null;
    } else if (!fence) {
      const match = line.match(/^ {0,3}(#{1,6})(?:[ \t]+|$)(.*)$/);
      if (match) {
        const text = match[2].replace(/[ \t]+#+[ \t]*$/, '').trim();
        headings.push({ level: match[1].length, text: text || '无标题', offset });
      }
    }
    offset += line.length + 1;
  }
  return headings;
}
