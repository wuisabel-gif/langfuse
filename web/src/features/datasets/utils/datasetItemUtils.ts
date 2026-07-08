import { showErrorToast } from "@/src/features/notifications/showErrorToast";
import { deepParseJson, type Prisma } from "@langfuse/shared";

/**
 * Converts a dataset item field value to a formatted JSON string.
 * Returns empty string for null/undefined values.
 *
 * Deep-parses nested JSON strings first so a JSON-string value (common for
 * OTLP-ingested traces, where non-primitive attributes are serialized to
 * strings) renders as expanded, editable JSON — matching the trace viewer —
 * instead of an escaped blob (issue #14751).
 */
export const stringifyDatasetItemData = (data: unknown): string => {
  if (!data) return "";

  try {
    // Clone objects first: deepParseJson mutates in place and `data` is often
    // shared React-query state we must not mutate.
    const parsed = deepParseJson(
      typeof data === "object" ? structuredClone(data) : data,
    );
    return JSON.stringify(parsed, null, 2);
  } catch {
    showErrorToast(
      "Failed to stringify data",
      "We are working on fixing this issue.",
    );
    return "";
  }
};

/**
 * Dataset schema shape used for validation
 */
export type DatasetSchema = {
  id: string;
  name: string;
  inputSchema: Prisma.JsonValue | null;
  expectedOutputSchema: Prisma.JsonValue | null;
};

/**
 * Transforms a full dataset object to the minimal schema shape needed for validation.
 * Ensures consistent dataset schema format across components.
 */
export const toDatasetSchema = (
  dataset: {
    id: string;
    name: string;
    inputSchema?: Prisma.JsonValue | null;
    expectedOutputSchema?: Prisma.JsonValue | null;
  } | null,
): DatasetSchema | null => {
  if (!dataset) return null;

  return {
    id: dataset.id,
    name: dataset.name,
    inputSchema: dataset.inputSchema ?? null,
    expectedOutputSchema: dataset.expectedOutputSchema ?? null,
  };
};
