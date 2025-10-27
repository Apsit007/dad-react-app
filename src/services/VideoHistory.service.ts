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

export type VideoHistoryListFilter = Partial<{
    title: string;         // ค้นหาชื่อวิดีโอ (ใช้ wildcard เช่น title~ชื่อ*)
    start_date: string;    // upload_start >= start_date
    end_date: string;      // upload_start <= end_date
}>;

/**
 * ดึงข้อมูลประวัติการอัปโหลดวิดีโอ (VDO Upload History)
 * Endpoint: /smartgate-api/v0/vdo-upload-history/get
 */
export const VideoHistoryApi = {
    async getHistory(
        page: number = 0,
        limit: number = 20,
        orderBy: string = "id.desc",
        filter?: VideoHistoryListFilter
    ): Promise<ApiResponse<VideoHistoryRecord[]>> {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("orderBy", orderBy);

        // ✅ เพิ่มระบบ filter เหมือน VehicleApi
        if (filter) {
            const clean: Record<string, any> = {};
            Object.entries(filter).forEach(([k, v]) => {
                if (v !== null && v !== undefined && v !== "") clean[k] = v;
            });

            if (Object.keys(clean).length > 0) {
                const filterStr = Object.entries(clean)
                    .map(([key, value]) => {
                        if (key === "title") {
                            return `${key}~${value}*`; // ✅ ค้นหาชื่อวิดีโอ
                        }
                        if (key === "start_date") {
                            return `upload_start>=${value}`; // ✅ เทียบ upload_start
                        }
                        if (key === "end_date") {
                            return `upload_start<=${value}`; // ✅ เทียบ upload_start
                        }
                        return `${key}=${value}`;
                    })
                    .join("&&");

                params.set("filter", filterStr);
            }
        }

        const url = `/smartgate-api/v0/vdo-upload-history/get?${params.toString()}`;
        const res = await http.get<ApiResponse<VideoHistoryRecord[]>>(url);
        return res.data;
    },

};
