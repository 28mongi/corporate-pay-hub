export const formatMoney = (n: number, currency = "TZS") => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${new Intl.NumberFormat("en-US").format(n)}`;
  }
};

export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
