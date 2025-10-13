// src/services/VideoHistory.service.ts
import http from "./http";
import type { ApiResponse } from "./ApiResponse";

export interface VideoHistoryRecord {
    id: number;
    title: string;
    upload_start: string;
    upload_complete: string | null;
    forward_start: string | null;
    forward_complete: string | null;
    process_start: string | null;
    process_complete: string | null;
    file_path: string;
    file_url: string;
    file_url_expires: string;
    file_size_mb: number;
    vdo_duration_seconds: number;
    uploader_uid: string;
    status: "uploaded" | "completed" | "failed" | string;
    uploader_fullname: string;
}



/**
 * ดึงข้อมูลประวัติการอัปโหลดวิดีโอ (VDO Upload History)
 * Endpoint: /smartgate-api/v0/vdo-upload-history/get
 */
export const VideoHistoryApi = {
    async getHistory(params?: {
        page?: number;
        limit?: number;
        orderBy?: string; // เช่น "id.desc" หรือ "id.asc"
    }): Promise<ApiResponse<VideoHistoryRecord[]>> {
        const url = `/smartgate-api/v0/vdo-upload-history/get`;
        const res = await http.get<ApiResponse<VideoHistoryRecord[]>>(url, { params });
        return res.data;
    },
};
