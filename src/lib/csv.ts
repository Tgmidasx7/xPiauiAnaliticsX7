export type CsvValue = string | number | boolean | null | undefined;

/** Quote every field and neutralize spreadsheet formulas, including leading whitespace. */
export function toCsv(headers: readonly string[], rows: readonly (readonly CsvValue[])[]): string {
  const escape = (value: CsvValue) => {
    let text = String(value ?? "");
    if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return "\uFEFF" + [headers, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
}

export function downloadCsv(
  filename: string,
  headers: readonly string[],
  rows: readonly (readonly CsvValue[])[],
) {
  const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
