// src/services/LprData.service.ts
import type { ApiResponse } from "./ApiResponse";
import http from "./http";

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
    member_firstname: string;
    member_lastname: string;
    member_group_en: string;
    member_group_th: string;
    department_name: string;
    member_expire: string;
    driver_image_url: string;
    datetime_in: string;
    datetime_out: string;

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

    feed: async (page = 1, limit = 10): Promise<ApiResponse<LprRecord[]>> => {
        const url = `/smartgate-api/v0/lpr-data/feed?page=${page}&limit=${limit}&orderBy=id.desc`;
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
};
