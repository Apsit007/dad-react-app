import * as XLSX from "xlsx";

export type ExportFileType = "txt" | "csv" | "xlsx";

/**
 * ฟังก์ชันสำหรับ export ข้อมูลเป็นไฟล์ตาม type ที่เลือก
 * @param rows ข้อมูล array ของ object (Vehicle[] หรืออะไรก็ได้)
 * @param fileType ประเภทไฟล์ ("txt" | "csv" | "xlsx")
 * @param fileName ชื่อไฟล์ (ไม่ต้องใส่นามสกุล)
 */
export const exportData = (
  rows: any[],
  fileType: ExportFileType,
  fileName: string = "export"
) => {
  if (!rows || rows.length === 0) {
    console.warn("⚠️ ไม่มีข้อมูลสำหรับ export");
    return;
  }

  switch (fileType) {
    case "txt": {
      const content = rows.map((r) => Object.values(r).join("\t")).join("\n");
      downloadFile(content, `${fileName}.txt`, "text/plain;charset=utf-8;");
      break;
    }

    case "csv": {
      const header = Object.keys(rows[0]).join(",");
      const body = rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const csv = [header, ...body].join("\n");
      downloadFile(csv, `${fileName}.csv`, "text/csv;charset=utf-8;");
      break;
    }

    case "xlsx": {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      break;
    }

    default:
      console.error("❌ Unsupported file type:", fileType);
  }
};

/** helper สำหรับดาวน์โหลดไฟล์ */
const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", fileName);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
