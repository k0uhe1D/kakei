import { MONTHS_AHEAD } from "../constants/defaults";

export function getMonthLabels(count = MONTHS_AHEAD) {
  const now = new Date();
  const labels = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${d.getFullYear()}年${d.getMonth() + 1}月`,
      short: `${d.getMonth() + 1}月`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return labels;
}

export function isActiveInMonth(item, monthKey) {
  if (item.recurring === false) {
    return item.specificMonth === monthKey;
  }
  const itemStart = item.startMonth || "0000-01";
  const itemEnd = item.endMonth || "9999-12";
  return monthKey >= itemStart && monthKey <= itemEnd;
}
