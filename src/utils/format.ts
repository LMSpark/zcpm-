export function formatMoney(value: number, unit = "元") {
  return `${Number(value || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: value >= 10000 ? 0 : 2,
    maximumFractionDigits: 2
  })}${unit}`;
}

export function formatDateTime(value?: string) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}

export function nowText() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function secondsUntil(value: string) {
  return Math.max(0, Math.floor((new Date(value).getTime() - Date.now()) / 1000));
}

export function countdown(value: string) {
  const total = secondsUntil(value);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${days}天${hours}小时${minutes}分${seconds}秒`;
}

export function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}
