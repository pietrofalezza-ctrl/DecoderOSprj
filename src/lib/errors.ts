export function getErrorMessage(error: unknown, fallback = "error"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }

  return fallback;
}

export function hasErrorName(error: unknown, name: string): boolean {
  const errorName =
    error instanceof Error
      ? error.name
      : error && typeof error === "object" && "name" in error
        ? (error as { name?: unknown }).name
        : null;

  return errorName === name;
}
