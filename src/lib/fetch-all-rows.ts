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

  // Use the actual number of rows returned by the server as the effective page
  // size. PostgREST / Supabase can enforce a max-rows cap that is lower than
  // our requested PAGE_SIZE (e.g. 870), so we must not assume PAGE_SIZE rows
  // per page when deciding whether there is more data to fetch.
  const pageSize = rows.length;

  if (first.count != null) {
    // Fast path: server returned an exact total count — use it to drive
    // concurrent fetches so we can load 15k+ rows in a few parallel batches.
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

  // Compatibility path for endpoints that cannot supply an exact count.
  // Compare against the *actual* server page size (pageSize), NOT PAGE_SIZE,
  // so that a server-enforced max-rows cap doesn't cause premature termination.
  if (rows.length < pageSize) return rows;
  for (let from = pageSize; ; from += pageSize) {
    const result = await fetchPage(from, from + pageSize - 1);
    if (result.error) throw new Error(result.error.message);
    const page = (result.data ?? []) as T[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}
