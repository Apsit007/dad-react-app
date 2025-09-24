import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "../assets/fonts/vfs_fonts"; // register generated Thai font bundle
import pdfFonts from "../../src/assets/fonts/vfs_fonts";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

const THAI_FONT_FAMILY = "NotoSansThai";

// ✅ กำหนดฟอนต์ที่จะใช้กับ pdfmake (ใช้ NotoSansThai ทั้ง normal, bold, italic, bolditalic)
(pdfMake as any).fonts = {
  ...((pdfMake as any).fonts || {}),
  [THAI_FONT_FAMILY]: {
    normal: "NotoSansThai.ttf",
    bold: "NotoSansThai.ttf",
    italics: "NotoSansThai.ttf",
    bolditalics: "NotoSansThai.ttf",
  },
};

export type ExportFileType = "txt" | "csv" | "xlsx" | "pdf";

/**
 * ฟังก์ชันหลักสำหรับ export ข้อมูลออกเป็นไฟล์หลายประเภท
 * @param rows ข้อมูล array ของ object (เช่น Vehicle[], Member[] ฯลฯ)
 * @param fileType ประเภทไฟล์ที่ต้องการ ("txt" | "csv" | "xlsx" | "pdf")
 * @param fileName ชื่อไฟล์ที่ต้องการ export (ไม่ต้องใส่นามสกุล)
 * @param columns columns ที่จะ export (ใช้ field + headerName จาก DataGrid)
 */
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

  switch (fileType) {
    case "txt": {
      // ✅ export เป็นไฟล์ .txt (tab-separated values)
      const useCols = columns?.map((c) => c.field) || Object.keys(rows[0]);
      const content = rows
        .map((r) => useCols.map((f) => r[f]).join("\t"))
        .join("\n");
      downloadFile(content, `${fileName}.txt`, "text/plain;charset=utf-8;");
      break;
    }

    case "csv": {
      // ✅ export เป็นไฟล์ .csv
      const useCols = columns?.map((c) => c.field) || Object.keys(rows[0]);
      const header =
        columns?.map((c) => c.headerName || c.field).join(",") ||
        Object.keys(rows[0]).join(",");
      const body = rows.map((r) =>
        useCols
          .map((f) => `"${String(r[f] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const csv = [header, ...body].join("\n");
      downloadFile(csv, `${fileName}.csv`, "text/csv;charset=utf-8;");
      break;
    }

    case "xlsx": {
      // ✅ export เป็นไฟล์ Excel (.xlsx)
      const useCols = columns?.map((c) => c.field) || Object.keys(rows[0]);
      const filtered = rows.map((r) =>
        Object.fromEntries(useCols.map((f) => [f, r[f]]))
      );
      const ws = XLSX.utils.json_to_sheet(filtered);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      break;
    }

    case "pdf": {
      // ✅ export เป็นไฟล์ PDF
      await exportPdf(rows, fileName, columns);
      break;
    }

    default:
      console.error("❌ Unsupported file type:", fileType);
  }
};

/** helper สำหรับดาวน์โหลดไฟล์ (ใช้ Blob + a tag) */
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

/** helper โหลดรูปจาก URL แล้วแปลงเป็น base64 สำหรับฝังใน PDF */
const getBase64FromUrl = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

/** ฟังก์ชันสำหรับ export PDF ด้วย pdfmake */
// const exportPdf = async (
//   rows: any[],
//   fileName: string,
//   columns?: { field: string; headerName?: string }[]
// ) => {
//   // ✅ เลือก columns โดยตัด actions, rownumb ออก
//   const filteredCols =
//     columns?.filter(
//       (c) =>
//         c.field.toLowerCase() !== "actions" &&
//         c.field.toLowerCase() !== "rownumb"
//     ) || Object.keys(rows[0]).filter(
//       (f) => f.toLowerCase() !== "actions" && f.toLowerCase() !== "rownumb"
//     ).map((f) => ({ field: f, headerName: f }));

//   // ✅ headers: เพิ่ม "ลำดับ" เป็น column แรก
//   const headers = ["ลำดับ", ...filteredCols.map((c) => c.headerName || c.field)];
//   const useCols = filteredCols.map((c) => c.field);

//   // head
//   const tableBody: any[] = [headers];

//   // body
//   for (let i = 0; i < rows.length; i++) {
//     const r = rows[i];
//     const rowData = await Promise.all(
//       useCols.map(async (f) => {
//         if (f.toLowerCase().includes("image") && r[f]) {
//           try {
//             const base64 = await getBase64FromUrl(r[f]);
//             return { image: base64, fit: [60, 60] };
//           } catch {
//             return "";
//           }
//         }
//         return String(r[f] ?? "");
//       })
//     );
//     // ✅ แทรก running number (i+1) เป็น column แรก
//     tableBody.push([i + 1, ...rowData]);
//   }

//   // ✅ สร้าง docDefinition สำหรับ pdfmake
//   const docDefinition: any = {
//     content: [
//       { text: fileName, style: "header", margin: [0, 0, 0, 10] },
//       {
//         table: {
//           headerRows: 1,
//           widths: Array(headers.length).fill('*'), // ✅ กระจายคอลัมน์อัตโนมัติเต็มหน้า
//           body: tableBody,
//         },
//         layout: "lightHorizontalLines",
//       },
//     ],
//     styles: {
//       header: {
//         fontSize: 16,
//         bold: true,
//       },
//       tableHeader: {
//         fontSize: 10, // ✅ ลดขนาดหัวตาราง
//         bold: true,
//       },
//       tableBody: {
//         fontSize: 9,  // ✅ ลดขนาดตัวอักษรเนื้อหา
//         noWrap: false // ✅ อนุญาตให้ขึ้นบรรทัดใหม่
//       },
//     },
//     defaultStyle: {
//       font: THAI_FONT_FAMILY,
//       fontSize: 9,  // ✅ ค่า default ให้เล็กลง
//     },
//   };

//   (pdfMake as any).createPdf(docDefinition).download(`${fileName}.pdf`);
// };

/** ฟังก์ชันสำหรับ export PDF ด้วย pdfmake (ตัด actions/rownumb + เพิ่มลำดับ + ปรับให้แสดงครบคอลัมน์) */
const exportPdf = async (
  rows: any[],
  fileName: string,
  columns?: { field: string; headerName?: string }[]
) => {
  // 1) กรองคอลัมน์: ตัด actions / rownumb
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

  // 2) header
  const headers = ["ลำดับ", ...filteredCols.map((c) => c.headerName || c.field)];
  const useCols = filteredCols.map((c) => c.field);

  // 3) header row → ชิดกลาง
  const headerRow = headers.map((h) => ({
    text: h,
    style: "tableHeader",
    alignment: "center",
    noWrap: false,
  }));

  // 4) body
  const tableBody: any[] = [headerRow];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const cells = await Promise.all(
      useCols.map(async (f) => {
        if (f.toLowerCase().includes("image") && r[f]) {
          try {
            const base64 = await getBase64FromUrl(r[f]);
            return {
              image: base64,
              fit: [40, 40],
              alignment: "center",
            };
          } catch {
            return "";
          }
        }
        return {
          text: String(r[f] ?? ""),
          style: "tableBody",
          noWrap: false, // ✅ ให้ตัดบรรทัดได้
          alignment: "left",
        };
      })
    );
    tableBody.push([
      { text: String(i + 1), alignment: "center" },
      ...cells,
    ]);
  }

  // 5) ให้ทุกคอลัมน์บีบในหน้ากระดาษ
  // const widths: (number | string)[] = Array(filteredCols.length + 1).fill("*");
  // 4) widths: ใช้จาก columns ถ้ามี width, ถ้าไม่มีก็ '*'
  const widths: (number | string)[] = [
    40, // ลำดับ fix 40px
    ...filteredCols.map((c) => c.width || "*"),
  ];
  // 6) docDefinition
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
