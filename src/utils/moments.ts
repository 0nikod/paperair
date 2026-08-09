import type { CollectionEntry } from "astro:content";
import { getDateParts } from "@utils/date";

export type MomentEntry = CollectionEntry<"moments">;

export interface MomentArchive {
  year: string;
  months: string[];
}

/** 返回按发布日期倒序排列的新数组，不修改 Content Collection 的原数组。 */
export function sortMomentsNewestFirst(
  moments: readonly MomentEntry[],
): MomentEntry[] {
  return moments.toSorted((a, b) => {
    const dateDifference = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    return dateDifference || a.id.localeCompare(b.id);
  });
}

/** 按站点时区筛选指定年份或月份的动态，并按发布日期倒序返回。 */
export function filterMomentsByArchive(
  moments: readonly MomentEntry[],
  year: string,
  month?: string,
): MomentEntry[] {
  return sortMomentsNewestFirst(
    moments.filter((moment) => {
      const parts = getDateParts(moment.data.pubDate);
      return parts.year === year && (!month || parts.month === month);
    }),
  );
}

/** 构建按年份、月份倒序排列的动态归档。 */
export function buildMomentArchives(
  moments: readonly MomentEntry[],
): MomentArchive[] {
  const archiveMap = new Map<string, Set<string>>();

  for (const moment of moments) {
    const { year, month } = getDateParts(moment.data.pubDate);
    const months = archiveMap.get(year) ?? new Set<string>();
    months.add(month);
    archiveMap.set(year, months);
  }

  return Array.from(archiveMap, ([year, months]) => ({
    year,
    months: Array.from(months).toSorted((a, b) => b.localeCompare(a)),
  })).toSorted((a, b) => b.year.localeCompare(a.year));
}
