// src/services/Export.service.ts
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import pdfMake from "pdfmake/build/pdfmake";

const THAI_FONT_FAMILY = "NotoSansThai";
const THAI_FONT_FILE_NAME = "NotoSansThai.ttf";
const THAI_FONT_URL = new URL("../assets/fonts/ttf/NotoSansThai.ttf", import.meta.url).href;

const pdfMakeAny = pdfMake as any;
const THAI_FONT_DEFINITION = {
  normal: THAI_FONT_FILE_NAME,
  bold: THAI_FONT_FILE_NAME,
  italics: THAI_FONT_FILE_NAME,
  bolditalics: THAI_FONT_FILE_NAME,
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
};

let thaiFontPromise: Promise<void> | null = null;
const ensureThaiFontLoaded = async (): Promise<void> => {
  if (!thaiFontPromise) {
    thaiFontPromise = (async () => {
      const response = await fetch(THAI_FONT_URL);
      if (!response.ok) {
        throw new Error(`Failed to load Thai font (${response.status} ${response.statusText})`);
      }
      const buffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      const ensureFontsObject = () => {
        pdfMakeAny.fonts = {
          ...(pdfMakeAny.fonts ?? {}),
          [THAI_FONT_FAMILY]: THAI_FONT_DEFINITION,
        };
      };

      if (typeof pdfMakeAny.addFontContainer === "function") {
        ensureFontsObject();
        pdfMakeAny.addFontContainer({
          vfs: {
            [THAI_FONT_FILE_NAME]: base64,
          },
          fonts: {
            [THAI_FONT_FAMILY]: THAI_FONT_DEFINITION,
          },
        });
      } else if (typeof pdfMakeAny.addVirtualFileSystem === "function") {
        ensureFontsObject();
        pdfMakeAny.addVirtualFileSystem({
          [THAI_FONT_FILE_NAME]: base64,
        });
      } else {
        ensureFontsObject();
        const currentVfs = pdfMakeAny.vfs ?? {};
        pdfMakeAny.vfs = { ...currentVfs, [THAI_FONT_FILE_NAME]: base64 };
      }
    })().catch((error) => {
      thaiFontPromise = null;
      throw error;
    });
  }

  return thaiFontPromise;
};

type PaginationInfo = {
  page: number;
  pageSize: number;
  rowCount: number;
};

export type ExportFileType = "txt" | "csv" | "xlsx" | "pdf";

/** 🔹 Export หลัก — ใช้ได้ทุกหน้า */
export const exportData = async (
  rows: any[],
  fileType: ExportFileType,
  fileName: string = "export",
  columns?: { field: string; headerName?: string; width?: number }[],
  paginationInfo?: PaginationInfo
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
      await exportPdf(rows, fileName, columns, paginationInfo);
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
  columns?: { field: string; headerName?: string; width?: number }[],
  paginationInfo?: PaginationInfo
) => {
  await ensureThaiFontLoaded();

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
        const value = safeValue(raw);
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
        return { text: value, style: "tableBody", alignment: "center" };
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

  // ✅ Header (แก้ให้แสดงวันที่ออกรายงานครบ)
  const now = dayjs().format("DD/MM/YYYY HH:mm:ss");
  const total = Number.isFinite(paginationInfo?.rowCount)
    ? Number(paginationInfo?.rowCount)
    : rows.length;
  const activePage = Number.isFinite(paginationInfo?.page)
    ? Number(paginationInfo?.page)
    : 0;
  const activePageSize =
    Number.isFinite(paginationInfo?.pageSize) && Number(paginationInfo?.pageSize) > 0
      ? Number(paginationInfo?.pageSize)
      : rows.length || 1;

  const calcStartIdx = () => {
    if (total === 0) return 0;
    const idx = activePage * activePageSize + 1;
    return Number.isFinite(idx) ? idx : 1;
  };

  const calcEndIdx = (startIdxValue: number) => {
    if (total === 0) return 0;
    const tentative = startIdxValue + activePageSize - 1;
    if (!Number.isFinite(tentative)) return rows.length;
    return Math.min(tentative, total);
  };

  const startIdx = calcStartIdx();
  const endIdx = calcEndIdx(startIdx);

  const headerStack = [
    { text: `ประเภทรายงาน: ${fileName}`, bold: true, fontSize: 11, margin: [0, 0, 0, 2] },
    { text: `รายการที่ ${startIdx} ถึง ${endIdx} จากทั้งหมด ${total} รายการ`, fontSize: 10, margin: [0, 0, 0, 2] },
    { text: `วันที่ออกรายงาน: ${now}`, fontSize: 10 },
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [20, 80, 20, 20],
    // ✅ ใช้ function ได้ใน 0.3.x แล้ว
    // pageMargins: (pageNumber: number) => {
    //   return pageNumber === 1 ? [20, 80, 20, 20] : [20, 20, 20, 20];
    // },

    header: (pageNumber: number) => {
      if (pageNumber === 1) {
        return {
          stack: headerStack,
          alignment: "left",
          margin: [20, 18, 0, 0],
        };
      }
      return null;
    },

    content: [
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
    defaultStyle: {
      font: THAI_FONT_FAMILY,
      fontSize: 8,
    },
  };

  (pdfMake as any).createPdf(docDefinition).download(`${fileName}.pdf`);
};
