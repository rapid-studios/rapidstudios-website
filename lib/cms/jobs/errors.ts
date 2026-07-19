export class JobApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "JobApiError";
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}
