// src/services/setting.service.ts
import http from "./http";
import type { ApiResponse } from "./ApiResponse";

export interface GateAccessValue {
    face: boolean;
    plate: boolean;
    member: boolean;
}

export interface BlacklistAccessValue {
    allow_enter: boolean;
    allow_exit: boolean;
}

export interface Setting {
    setting_code: string;
    setting_name: string;
    setting_value: GateAccessValue | BlacklistAccessValue; // ✅ รองรับทั้งสองแบบ
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


    // ✅ อัปเดตค่าตั้งค่า (รองรับทั้ง gate_access_options และ blacklist_access_options)
    update: async (
        settingCode: string,
        value: any
    ): Promise<ApiResponse<Setting>> => {
        // เตรียมข้อมูลของแต่ละ setting
        const settingMeta: Record<string, { name: string; desc: string }> = {
            gate_access_options: {
                name: "Gate Access Options",
                desc: "Gate access options (Plate, Face, Member)",
            },
            blacklist_access_options: {
                name: "Blacklist Access Options",
                desc: "Blacklist access options (Enter, Exit)",
            },
        };

        const meta = settingMeta[settingCode];
        if (!meta) throw new Error(`Unknown setting_code: ${settingCode}`);

        const res = await http.put<ApiResponse<Setting>>(
            `/smartgate-api/v0/settings/update`,
            {
                setting_code: settingCode,
                setting_name: meta.name,
                description: meta.desc,
                setting_value: value,
            }
        );

        return res.data;
    },
};
