// src/services/Export.service.ts
import * as XLSX from "xlsx";
import dayjs from "dayjs";
// import pdfMake from "pdfmake/build/pdfmake";
import pdfMake from "pdfmake/build/pdfmake.min";
import JSZip from "jszip"; // ✅ npm i jszip
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

const MAX_ROWS_PER_BATCH = 300;

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
      // await exportPdf(rows, fileName, columns, paginationInfo);
      if (rows.length > 2000) {
        await exportLargePdf(rows, fileName, columns, paginationInfo);
      } else {
        await exportPdf(rows, fileName, columns, paginationInfo);
      }
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

        // 🖼️ ถ้าเป็น field รูปภาพ (มี URL)
        if (
          (f.toLowerCase().includes("image") ||
            f.toLowerCase().includes("face") ||
            f.toLowerCase().includes("url")) &&
          typeof raw === "string" &&
          raw.startsWith("http")
        ) {
          try {
            const base64 = await getBase64FromUrl(raw);

            // 🏷️ ใช้ tag จากข้อมูลจริงของ row
            let tagLabel = "";
            if (f.toLowerCase().includes("overview")) {
              tagLabel = r.vehicle_group_name_en || r.vehicle_group_en || "";
            } else if (f.toLowerCase().includes("driver") || f.toLowerCase().includes("face")) {
              tagLabel = r.driver_group_name_en || r.driver_group_en || "";
            } else if (f.toLowerCase().includes("fdlib") || f.toLowerCase().includes("member")) {
              // ถ้ามี member group name ใช้แทน
              tagLabel =
                r.member_data?.member_group_name_en ||
                r.driver_group_name_en ||
                r.member_group_en ||
                "Visitor";
            }

            return {
              stack: [
                {
                  image: base64,
                  width: 45,
                  height: 45,
                  alignment: "center",
                  margin: [0, 0, 0, 2],
                },
                {
                  text: tagLabel || "Visitor",
                  fontSize: 7,
                  color: "#444",
                  alignment: "center",
                },
              ],
              alignment: "center",
              margin: [0, 2, 0, 2],
            };
          } catch {
            return { text: "-", alignment: "center" };
          }
        }

        // 🔹 กรณีทั่วไป (ไม่ใช่รูปภาพ)
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
        stack: [
          {
            table: {
              headerRows: 1,
              widths,
              body: tableBody,
              dontBreakRows: true, // ✅ บังคับไม่ให้แยกแถว
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              paddingLeft: () => 2,
              paddingRight: () => 2,
              paddingTop: () => 3,
              paddingBottom: () => 3,
              fillColor: (rowIndex: number) =>
                rowIndex === 0 ? "#f5f5f5" : null,
              minCellHeight: 65, // ✅ ความสูงเท่ากันทุกแถว
              dontBreakRows: true,
              keepWithHeaderRows: 1, // ✅ ยกทั้งแถวขึ้นหน้าถัดไป
            },
          },
        ],
        // ✅ สำคัญ! ตัวนี้ทำให้ pdfMake รู้ว่าห้ามแยก stack นี้ข้ามหน้า
        dontBreakRows: true,
        keepTogether: true,
      },
    ],

    defaultStyle: {
      font: THAI_FONT_FAMILY,
      fontSize: 8,
      alignment: "center",
      valign: "middle",
    },
  };


  (pdfMake as any).createPdf(docDefinition).download(`${fileName}.pdf`);
};

// ✅ ฟังก์ชันหลัก
export const exportLargePdf = async (
  rows: any[],
  fileName: string,
  columns?: { field: string; headerName?: string; width?: number }[],
  paginationInfo?: any,
  onProgress?: (current: number, total: number) => void
) => {
  await ensureThaiFontLoaded();

  const totalParts = Math.ceil(rows.length / MAX_ROWS_PER_BATCH);
  const zip = new JSZip(); // ✅ ZIP object

  for (let i = 0; i < rows.length; i += MAX_ROWS_PER_BATCH) {
    const partRows = rows.slice(i, i + MAX_ROWS_PER_BATCH);
    const partIndex = Math.floor(i / MAX_ROWS_PER_BATCH) + 1;
    console.log(`📄 สร้าง PDF ส่วนที่ ${partIndex}/${totalParts} ...`);
    onProgress?.(partIndex - 1, totalParts);

    try {
      const pdfBytes = await createPartialPdf(partRows, fileName, columns, paginationInfo, partIndex);
      // ✅ แปลง buffer ให้ชัดเจน
      const arrayBuffer = pdfBytes.buffer as ArrayBuffer;
      zip.file(`${fileName}_part${partIndex}.pdf`, arrayBuffer, { binary: true });
      onProgress?.(partIndex, totalParts);
    } catch (err) {
      console.error(`❌ สร้าง PDF ส่วนที่ ${partIndex} ล้มเหลว`, err);
    }
  }

  console.log("📦 กำลังบีบอัด ZIP ...");
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }, // 1=เร็ว, 9=เล็กสุด
  });
  const now = dayjs().format("YYYYMMDD_HHmmss");
  const zipName = `${fileName}_${now}.zip`;

  // ✅ ดาวน์โหลดไฟล์ ZIP
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log("✅ สร้าง ZIP สำเร็จ:", zipName);
  onProgress?.(totalParts, totalParts);
};


// ✅ ฟังก์ชันย่อย สร้าง PDF ย่อยแต่ละชุด (return Uint8Array)
const createPartialPdf = async (
  rows: any[],
  fileName: string,
  columns?: { field: string; headerName?: string; width?: number }[],
  paginationInfo?: any,
  partIndex?: number
): Promise<Uint8Array> => {
  await ensureThaiFontLoaded();

  const safeValue = (v: any): string => {
    if (v === undefined || v === null || v === "") return "-";
    return String(v);
  };

  const filteredCols =
    columns?.filter(
      (c) => !["actions", "rownumb"].includes(c.field.toLowerCase())
    ) ?? Object.keys(rows[0]).map((f) => ({ field: f, headerName: f }));

  const headers = ["ลำดับ", ...filteredCols.map((c) => c.headerName || c.field)];
  const useCols = filteredCols.map((c) => c.field);

  const tableBody: any[] = [
    headers.map((h) => ({ text: h, style: "tableHeader", alignment: "center" })),
  ];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const cells = useCols.map((f) => ({
      text: safeValue(r[f]),
      alignment: "center",
      style: "tableBody",
    }));
    tableBody.push([{ text: String(i + 1), alignment: "center" }, ...cells]);
  }

  const widths = [30, ...filteredCols.map(() => "*")];

  const now = dayjs().format("DD/MM/YYYY HH:mm:ss");
  const docDefinition = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [20, 70, 20, 20],
    header: [
      {
        text: `รายงาน: ${fileName} (ส่วนที่ ${partIndex})`,
        bold: true,
        fontSize: 11,
        margin: [20, 15, 0, 0],
      },
      { text: `วันที่: ${now}`, fontSize: 9, margin: [20, 0, 0, 5] },
    ],
    content: [
      {
        table: {
          headerRows: 1,
          widths,
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#f5f5f5" : null),
          hLineWidth: () => 0.3,
          vLineWidth: () => 0.3,
        },
      },
    ],
    defaultStyle: {
      font: "NotoSansThai",
      fontSize: 8,
    },
  };

  // ✅ ป้องกันการค้าง: timeout 45s + reject ได้
  console.log(`🧩 เริ่มสร้าง PDF ส่วนที่ ${partIndex}, จำนวนแถว ${rows.length}`);

  return new Promise((resolve, reject) => {
    const pdf = (pdfMake as any).createPdf(docDefinition);
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout while generating part ${partIndex}`));
    }, 120000);

    try {
      pdf.getBlob((blob: Blob) => {
        clearTimeout(timeout);
        blob.arrayBuffer().then((buffer) => {
          resolve(new Uint8Array(buffer));
        });
      });
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
};

