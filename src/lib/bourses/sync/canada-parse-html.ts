export interface UdemBourseEntry {
  title: string;
  path: string;
  montant?: string;
  dateLimiteIso?: string;
  description?: string;
  expired: boolean;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseUdemBoursesHtml(html: string): UdemBourseEntry[] {
  const items: UdemBourseEntry[] = [];
  const regex =
    /<a class="([^"]*)" href="(\/repertoire-des-bourses\/detail-dune-bourse\/[^"]+)">([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const block = match[3];
    const titleMatch = block.match(/<h3 class="titre"[^>]*>([\s\S]*?)<\/h3>/);
    if (!titleMatch) continue;

    const title = decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, ""));
    const montantMatch = block.match(/Montant[^<]*<b>([\s\S]*?)<\/b>/);
    const dateMatch = block.match(/data-sort-value="([^"]+)"/);
    const descMatch = block.match(
      /<div class="tx-udembourses-description-courte">\s*([\s\S]*?)\s*<\/div>/,
    );

    items.push({
      title,
      path: match[2],
      montant: montantMatch ? decodeHtmlEntities(montantMatch[1]) : undefined,
      dateLimiteIso: dateMatch?.[1],
      description: descMatch ? decodeHtmlEntities(descMatch[1]) : undefined,
      expired: match[1].includes("expiree"),
    });
  }

  const byPath = new Map<string, UdemBourseEntry>();
  for (const item of items) {
    byPath.set(item.path, item);
  }
  return [...byPath.values()];
}

export function buildUdemBourseUrl(path: string): string {
  return `https://bourses.umontreal.ca${path}`;
}
