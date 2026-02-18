export function fmt(n) {
  return Math.round(n).toLocaleString("ja-JP");
}

export function pct(a, b) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}
