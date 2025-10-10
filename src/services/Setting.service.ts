// src/services/setting.service.ts
import http from "./http";
import type { ApiResponse } from "./ApiResponse";

export interface Setting {
    setting_code: string;
    setting_name: string;
    setting_value: {
        face: boolean;
        plate: boolean;
        member: boolean;
        [key: string]: any; // เผื่อมีค่าอื่นในอนาคต
    };
    description: string;
}

export interface SettingListResponse extends ApiResponse<Setting[]> {
    pagination: {
        page: number;
        maxPage: number;
        limit: number;
        count: number;
        countAll: number;
    };
}

export const SettingApi = {
    // ✅ ดึงค่าตั้งค่า (list)
    get: async (
        page = 1,
        limit = 10
    ): Promise<SettingListResponse> => {
        const res = await http.get<SettingListResponse>(
            `/smartgate-api/v0/settings/get?page=${page}&limit=${limit}`
        );
        return res.data;
    },


    // ✅ อัปเดตค่าตั้งค่า
    update: async (value: any): Promise<ApiResponse<Setting>> => {
        const res = await http.put<ApiResponse<Setting>>(
            `/smartgate-api/v0/settings/update`,
            {
                "setting_code": "gate_access_options",
                "setting_name": "Gate Access Options",
                "description": "Gate access options (Plate, Face, Member)",
                setting_value: value
            }
        );
        return res.data;
    },
};
