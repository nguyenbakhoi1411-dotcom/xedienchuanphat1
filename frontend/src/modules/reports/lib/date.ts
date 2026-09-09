export function formatDate(date: Date, pattern: "yyyy-MM-dd" | "dd/MM/yyyy") {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (pattern === "dd/MM/yyyy") {
    return `${day}/${month}/${year}`;
  }

  return `${year}-${month}-${day}`;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31);
}
