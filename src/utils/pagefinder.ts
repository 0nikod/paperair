/**
 * PageFinder - 封装 Pagefind 搜索核心的抽象类
 *
 * 提供按需加载、带分类过滤的搜索能力。
 * 仅在用户首次触发搜索时才加载 Pagefind 运行时（约 ~20kb），
 * 实现零首屏成本。
 */

export interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
  type: string;
}

export type SearchFilter = "all" | "blog" | "moment";

// Pagefind JS API 的类型定义（简化）
interface PagefindInstance {
  init: () => Promise<void>;
  search: (
    query: string,
    options?: { filters?: Record<string, string> },
  ) => Promise<{ results: PagefindResult[] }>;
}

interface PagefindResult {
  data: () => Promise<PagefindResultData>;
}

interface PagefindResultData {
  url: string;
  meta: { title?: string };
  excerpt: string;
  filters: Record<string, string[]>;
}

let instance: PagefindInstance | null = null;

/**
 * 按需初始化 Pagefind 实例。
 * 仅在首次调用时加载 pagefind.js，后续调用直接复用。
 */
async function init(): Promise<PagefindInstance> {
  if (instance) return instance;

  const pfPath = "/pagefind/pagefind.js";
  const pagefind = await import(/* @vite-ignore */ pfPath);

  await pagefind.init();
  instance = pagefind;
  return pagefind;
}

/**
 * 执行搜索并返回标准化的结果列表。
 *
 * @param query   - 搜索关键词
 * @param filter  - 内容类型过滤："all" | "blog" | "moment"
 * @param month   - 可选，月份过滤，例如 "2024-03" (需要和上面 year 对应，或者单独传)
 * @param limit   - 返回的最大结果数量，默认为 8
 * @returns 最多 limit 条 SearchResult
 */
export async function search(
  query: string,
  filter: SearchFilter = "all",
  year: string = "all",
  month: string = "all",
  limit: number = 8,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const pf = await init();

  const options: { filters?: Record<string, string> } = {};
  if (filter !== "all" || year !== "all" || month !== "all") {
    options.filters = {};
    if (filter !== "all") {
      options.filters.type = filter;
    }
    if (year !== "all") {
      options.filters.year = year;
    }
    if (month !== "all") {
      options.filters.month = month;
    }
  }

  const { results } = await pf.search(query, options);

  // 仅取前 limit 条结果并并行获取详情
  const items = await Promise.all(results.slice(0, limit).map((r) => r.data()));

  return items.map((item) => ({
    url: item.url,
    title: item.meta.title ?? "无标题",
    excerpt: item.excerpt,
    type: item.filters.type?.[0] ?? "unknown",
  }));
}
