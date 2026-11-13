const numberFormatter = new Intl.NumberFormat("pt-BR");
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Fortaleza",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Fortaleza",
});

export const formatNumber = (value: number) => numberFormatter.format(value);
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso));
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso)).replaceAll(".", "");
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export const matchesSearch = (value: string, query: string) =>
  normalizeSearch(value).includes(normalizeSearch(query));
