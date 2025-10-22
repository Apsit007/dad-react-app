// src/services/LprData.service.ts
import type { ApiResponse } from "./ApiResponse";
import http from "./http";
import type { GateAccessValue } from "./Setting.service";

// --- Response types ---
export interface data {
    stats: LprStat[]
}
export interface LprStat {
    vehicle_group_id: number | null;
    vehicle_group_name: string;
    total_in: number;
    total_out: number;
    remains: number;
}

// แต่ละ record ของ LPR Data


export interface LprRecord {
    id: string;
    datetime: string;
    direction: string;
    direction_th: string;
    overview_image_url: string;
    plate_image_url: string;
    plate: string;
    plate_prefix: string;
    plate_number: string;
    region_code: string;
    region_en: string;
    region_th: string;
    vehicle_make: string;
    vehicle_make_th: string;
    vehicle_make_en: string;
    vehicle_model: string;
    vehicle_model_th: string;
    vehicle_model_en: string;
    vehicle_color: string;
    vehicle_color_th: string;
    vehicle_color_en: string;
    vehicle_group: number;
    vehicle_group_en: string;
    vehicle_group_th: string;
    driver_group_th: string;
    driver_group_en: string;
    member_firstname: string;
    member_lastname: string;
    driver_firstname: string;
    driver_lastname: string;
    member_group_en: string;
    member_group_th: string;
    department_name: string;
    member_expire: string;
    driver_image_url: string;
    member_image_url: string;
    datetime_in: string;
    datetime_out: string;
    lprId: string;
    acces_config: GateAccessValue;
}


export type LprVehicleFilter = Partial<{
    plate_prefix: string;
    plate_number: string;
    region_code: string;
    vehicle_make: string;
    vehicle_color: string;
    vehicle_body_type: string;
    // date range
    start_date: string; // ISO string
    end_date: string;   // ISO string
}>;


// --- Service ---
export const LprDataApi = {
    // 👉 Get LPR statistics
    getStats: async (): Promise<ApiResponse<data>> => {
        const url = `/smartgate-api/v0/lpr-data/stats`;
        const res = await http.get<ApiResponse<data>>(url);
        return res.data;
    },

    feed: async (page = 1, limit = 10, includeFaceData = false): Promise<ApiResponse<LprRecord[]>> => {
        const url = `/smartgate-api/v0/lpr-data/feed?page=${page}&limit=${limit}&orderBy=id.desc&includeFaceData=${includeFaceData}`;
        const res = await http.get<ApiResponse<LprRecord[]>>(url);
        return res.data;
    },

    searchVehicles: async (params: {
        plate_prefix?: string;
        plate_number?: string;
        region_code?: string;
        vehicle_make?: string;
        vehicle_color?: string;
        vehicle_body_type?: string;
        vehicle_group_id?: number;
        direction?: string;
        start_date?: string;
        end_date?: string;
        page?: number;
        limit?: number;
        orderBy?: string;
    }): Promise<ApiResponse<LprRecord[]>> => {
        const url = "/smartgate-api/v0/lpr-data/search-vehicles";
        const res = await http.get<ApiResponse<LprRecord[]>>(url, { params });
        return res.data;
    },

    uploadVideo: async (
        video: File,
        title: string,
        uploader_uid: string,
        onProgress?: (percent: number) => void
    ): Promise<any> => {
        const url = `/smartgate-api/v0/lpr-data/upload-video`;
        const formData = new FormData();
        formData.append("video", video);
        formData.append("title", title);
        formData.append("uploader_uid", uploader_uid);

        const res = await http.post<any>(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
                if (event.total) {
                    const percent = Math.round((event.loaded * 100) / event.total);
                    onProgress?.(percent);
                }
            },
        });
        return res.data;
    },

    /**
  * 🔹 ประมวลผลวิดีโอที่อัปโหลดแล้ว
  * POST /smartgate-api/v0/lpr-data/process-video
  * @param filePath ตัวอย่างเช่น "/api-storage/uploads/videos/2025-10-13/101616-SovsNQR8Q51E.mp4"
  */
    processVideo: async (filePath: string): Promise<ApiResponse<any>> => {
        const url = `/smartgate-api/v0/lpr-data/process-video`;
        const payload = { filePath };
        const res = await http.post<ApiResponse<any>>(url, payload);
        return res.data;
    },

    /**
   * 🔹 ดึงข้อมูลผลการถอดภาพจากวิดีโอ (LPR จาก video)
   * GET /smartgate-api/v0/lpr-data/video-results
   * ใช้ video_id อ้างถึงวิดีโอที่อัปโหลดไว้
   * รองรับการกรองข้อมูล เช่น plate, region_code, vehicle_group_id และ pagination
   */
    getVideoResults: async (params: {
        video_id: number;             // 🟢 จำเป็น ต้องมีเสมอ
        plate?: string;               // หมายเลขทะเบียน
        region_code?: string;         // รหัสจังหวัด (เช่น "th-10")
        vehicle_group_id?: number;    // กลุ่มรถ
        page?: number;                // หน้า (เริ่มจาก 1)
        limit?: number;               // จำนวนรายการต่อหน้า
        orderBy?: string;             // เช่น "id.desc"
    }): Promise<ApiResponse<LprRecord[]>> => {
        const url = `/smartgate-api/v0/lpr-data/video-results`;
        const res = await http.get<ApiResponse<LprRecord[]>>(url, { params });
        return res.data;
    },
};
