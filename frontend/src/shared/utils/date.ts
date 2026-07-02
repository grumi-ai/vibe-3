const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(value: string | Date): Date {
  return value instanceof Date ? new Date(value.getTime()) : new Date(value);
}

export function startOfWeek(value: string | Date): Date {
  const date = parseDate(value);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfWeek(value: string | Date): Date {
  const date = startOfWeek(value);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function startOfMonth(value: string | Date): Date {
  const date = parseDate(value);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfMonth(value: string | Date): Date {
  const date = startOfMonth(value);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function addDays(value: string | Date, amount: number): Date {
  const date = parseDate(value);
  date.setTime(date.getTime() + amount * DAY_MS);
  return date;
}

export function formatDate(date: string | Date): string {
  const value = parseDate(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateTime(date: string | Date): string {
  const value = parseDate(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function toInputDate(date: string | Date): string {
  return formatDate(date);
}

export function toInputDateTime(date: string | Date): string {
  return formatDateTime(date);
}

export function startOfDay(value: string | Date): Date {
  const date = parseDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfDay(value: string | Date): Date {
  const date = parseDate(value);
  date.setHours(23, 59, 59, 999);
  return date;
}
