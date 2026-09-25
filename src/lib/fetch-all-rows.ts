const PAGE_SIZE = 1000;
const CONCURRENCY = 4;

type PageResult = {
  data: unknown[] | null;
  error: { message: string } | null;
  count?: number | null;
};

/** Callers must order by a unique key so concurrent pages do not overlap. */
export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult>,
): Promise<T[]> {
  const first = await fetchPage(0, PAGE_SIZE - 1);
  if (first.error) throw new Error(first.error.message);
  const rows = (first.data ?? []) as T[];
  if (rows.length === 0) return rows;

  // Respect a server row limit smaller than the requested page size.
  const pageSize = rows.length;
  if (first.count != null) {
    for (
      let from = pageSize;
      from < first.count;
      from += pageSize * CONCURRENCY
    ) {
      const pages = await Promise.all(
        Array.from(
          {
            length: Math.min(
              CONCURRENCY,
              Math.ceil((first.count - from) / pageSize),
            ),
          },
          async (_, index) => {
            const start = from + index * pageSize;
            const result = await fetchPage(start, start + pageSize - 1);
            if (result.error) throw new Error(result.error.message);
            return (result.data ?? []) as T[];
          },
        ),
      );
      for (const page of pages) rows.push(...page);
    }
    return rows;
  }

  // Compatibility for endpoints that cannot supply an exact count.
  if (rows.length < PAGE_SIZE) return rows;
  for (let from = PAGE_SIZE; ; from += PAGE_SIZE) {
    const result = await fetchPage(from, from + PAGE_SIZE - 1);
    if (result.error) throw new Error(result.error.message);
    const page = (result.data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}
