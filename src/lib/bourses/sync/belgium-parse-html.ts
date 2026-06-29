export interface StudyInBelgiumRawEntry {
  title: string;
  path: string;
  audience: string;
}

export interface StudyInBelgiumMergedEntry {
  title: string;
  path: string;
  audiences: string[];
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

function normalizeAudience(audience: string): string {
  const a = decodeHtmlEntities(audience);
  if (/internationaux/i.test(a)) return "Toutes nationalités";
  return a;
}

export function parseStudyInBelgiumHtml(html: string): StudyInBelgiumRawEntry[] {
  const items: StudyInBelgiumRawEntry[] = [];
  const regex =
    /<a href="(\/fr\/bourses\/[^"]+)" class="scholarship">[\s\S]*?<p class="country">\s*([\s\S]*?)\s*<\/p>\s*<h3>([\s\S]*?)<\/h3>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const path = match[1].trim();
    const audience = normalizeAudience(match[2]);
    const title = decodeHtmlEntities(match[3].replace(/<[^>]+>/g, ""));
    if (!title) continue;
    items.push({ title, path, audience });
  }

  return items;
}

export function mergeStudyInBelgiumEntries(
  raw: StudyInBelgiumRawEntry[],
): StudyInBelgiumMergedEntry[] {
  const byPath = new Map<string, StudyInBelgiumMergedEntry>();

  for (const item of raw) {
    const existing = byPath.get(item.path);
    if (!existing) {
      byPath.set(item.path, {
        title: item.title,
        path: item.path,
        audiences: [item.audience],
      });
      continue;
    }

    if (!existing.audiences.includes(item.audience)) {
      existing.audiences.push(item.audience);
    }
  }

  return [...byPath.values()];
}

export function buildStudyInBelgiumUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `https://www.studyinbelgium.be${path}`;
}

export function inferProviderFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ares")) return "ARES";
  if (t.includes("fnrs") || t.includes("fria") || t.includes("fresh")) return "FNRS";
  if (t.includes("wbi")) return "WBI";
  if (t.includes("auf")) return "AUF";
  if (t.includes("erasmus")) return "Erasmus+";
  if (t.includes("embo")) return "EMBO";
  if (t.includes("erc")) return "ERC";
  return "Study in Belgium";
}
