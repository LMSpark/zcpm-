import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

type SheetRows = Record<string, unknown>[];

function saveBlob(name: string, blob: Blob) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

export function downloadXlsx(fileName: string, sheets: Record<string, SheetRows>) {
  const workbook = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([sheetName, rows]) => {
    const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ 提示: "暂无数据" }]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  });
  XLSX.writeFile(workbook, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
}

export function downloadPdf(fileName: string, title: string, rows: SheetRows) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 40, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const lines = rows.length
    ? rows.flatMap((row, index) => [`${index + 1}. ${Object.entries(row).map(([key, value]) => `${key}: ${String(value ?? "-")}`).join("  ")}`])
    : ["暂无数据"];
  let y = 78;
  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, 515);
    wrapped.forEach((text: string) => {
      if (y > 780) {
        doc.addPage();
        y = 48;
      }
      doc.text(text, 40, y);
      y += 16;
    });
  });
  doc.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}

export function downloadTextFile(fileName: string, content: string) {
  saveBlob(fileName, new Blob([content], { type: "text/plain;charset=utf-8" }));
}
