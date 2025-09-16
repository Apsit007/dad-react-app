// src/services/fileupload.service.ts
import http from "./http";

// ✅ response object ที่ API ส่งกลับ
export interface FileUploadData {
    filename: string;
    originalName: string;
    mimetype: string;
    sizeMB: number;
    title: string;
    url: string;
}

export interface FileUploadResponse {
    endpoint: string;
    statusCode: number;
    status: string;
    success: boolean;
    message: string;
    data: FileUploadData[]
}

export const FileUploadApi = {
    // 👉 Upload multiple files
    upload: async (file: File): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append("files", file);

        const url = `/smartgate-api/v0/upload/`;

        const res = await http.post<FileUploadResponse>(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    },
};

export default FileUploadApi;
