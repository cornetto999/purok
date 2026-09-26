/**
 * Error reporting stub — Lovable SDK removed.
 * Errors are logged to the console only.
 */
export function reportLovableError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  console.error("[ErrorBoundary]", context, error);
}
