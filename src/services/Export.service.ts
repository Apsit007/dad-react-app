// src/services/Export.service.ts
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "../../src/assets/fonts/vfs_fonts";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

const THAI_FONT_FAMILY = "NotoSansThai";
(pdfMake as any).fonts = {
  [THAI_FONT_FAMILY]: {
    normal: "NotoSansThai.ttf",
    bold: "NotoSansThai.ttf",
    italics: "NotoSansThai.ttf",
    bolditalics: "NotoSansThai.ttf",
  },
};

export type ExportFileType = "txt" | "csv" | "xlsx" | "pdf";

/** 🔹 Export หลัก — ใช้ได้ทุกหน้า */
export const exportData = async (
  rows: any[],
  fileType: ExportFileType,
  fileName: string = "export",
  columns?: { field: string; headerName?: string; width?: number }[]
) => {
  if (!rows || rows.length === 0) {
    console.warn("⚠️ ไม่มีข้อมูลสำหรับ export");
    return;
  }

  // ✅ Helper: ถ้าไม่มีค่าให้แสดง "-"
  const safeValue = (v: any): string => {
    if (v === undefined || v === null || v === "") return "-";
    return String(v);
  };

  // ✅ กรอง columns ที่ต้องใช้
  const filteredCols =
    columns
      ?.filter(
        (c) =>
          !["actions", "rownumb"].includes(c.field.toLowerCase())
      )
      .map((c) => ({
        field: c.field,
        headerName: c.headerName ?? c.field,
        width: c.width,
      })) ??
    Object.keys(rows[0]).map((f) => ({ field: f, headerName: f }));

  const useCols = filteredCols.map((c) => c.field);
  const headers = filteredCols.map((c) => c.headerName);

  switch (fileType) {
    case "txt": {
      const content = [
        headers.join("\t"),
        ...rows.map((r) =>
          useCols.map((f) => safeValue(r[f])).join("\t")
        ),
      ].join("\n");
      downloadFile(content, `${fileName}.txt`, "text/plain;charset=utf-8;");
      break;
    }

    case "csv": {
      const csvRows = [
        headers.join(","),
        ...rows.map((r) =>
          useCols
            .map((f) => `"${safeValue(r[f]).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ];
      downloadFile(csvRows.join("\n"), `${fileName}.csv`, "text/csv;charset=utf-8;");
      break;
    }

    case "xlsx": {
      const filtered = rows.map((r) =>
        Object.fromEntries(useCols.map((f) => [f, safeValue(r[f])]))
      );
      const ws = XLSX.utils.json_to_sheet(filtered, { header: useCols });
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A1" });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      break;
    }

    case "pdf": {
      await exportPdf(rows, fileName, columns);
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

/** helper โหลดรูปจาก URL แล้วแปลงเป็น base64 */
const getBase64FromUrl = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("failed"));
    reader.readAsDataURL(blob);
  });
};

/** ✅ Export PDF */
const exportPdf = async (
  rows: any[],
  fileName: string,
  columns?: { field: string; headerName?: string; width?: number }[]
) => {
  const safeValue = (v: any): string => {
    if (v === undefined || v === null || v === "") return "-";
    return String(v);
  };

  // 1️⃣ กรองคอลัมน์
  const filteredCols =
    columns?.filter(
      (c) =>
        c.field.toLowerCase() !== "actions" &&
        c.field.toLowerCase() !== "rownumb"
    ) ||
    Object.keys(rows[0])
      .filter(
        (f) =>
          f.toLowerCase() !== "actions" && f.toLowerCase() !== "rownumb"
      )
      .map((f) => ({ field: f, headerName: f }));

  // 2️⃣ header
  const headers = ["ลำดับ", ...filteredCols.map((c) => c.headerName || c.field)];
  const useCols = filteredCols.map((c) => c.field);

  const headerRow = headers.map((h) => ({
    text: h,
    style: "tableHeader",
    alignment: "center",
    noWrap: false,
  }));

  // 3️⃣ body
  const tableBody: any[] = [headerRow];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    const cells = await Promise.all(
      useCols.map(async (f) => {
        const raw = r[f];
        const value = safeValue(raw); // ✅ ใช้ safeValue ครอบทุกกรณี

        // 🔸 ตรวจจับฟิลด์รูปภาพ
        if (
          (f.toLowerCase().includes("image") ||
            f.toLowerCase().includes("face") ||
            f.toLowerCase().includes("url")) &&
          typeof raw === "string" &&
          raw.startsWith("http")
        ) {
          try {
            const base64 = await getBase64FromUrl(raw);
            return { image: base64, fit: [45, 45], alignment: "center" };
          } catch {
            return { text: "-", alignment: "center" };
          }
        }

        // 🔸 ฟิลด์ข้อความทั่วไป
        return {
          text: value,
          style: "tableBody",
          alignment: "center",
          noWrap: false,
        };
      })
    );

    tableBody.push([{ text: String(i + 1), alignment: "center" }, ...cells]);
  }

  // 4️⃣ widths
  const widths: (number | string)[] = [
    40,
    ...filteredCols.map((c) => {
      const name = c.field.toLowerCase();
      if (name.includes("image") || name.includes("face") || name.includes("url")) return 55;
      return c.width || "*";
    }),
  ];

  // 5️⃣ generate PDF
  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [10, 10, 10, 10],
    content: [
      { text: fileName, style: "header", margin: [0, 0, 0, 8] },
      {
        table: {
          headerRows: 1,
          widths,
          body: tableBody,
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingLeft: () => 2,
          paddingRight: () => 2,
          paddingTop: () => 3,
          paddingBottom: () => 3,
        },
      },
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      tableHeader: { fontSize: 9, bold: true, alignment: "center" },
      tableBody: { fontSize: 8 },
    },
    defaultStyle: {
      font: THAI_FONT_FAMILY,
      fontSize: 8,
    },
  };

  (pdfMake as any).createPdf(docDefinition).download(`${fileName}.pdf`);
};
