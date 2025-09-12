import type { ApiResponse } from "./ApiResponse";
import http from "./http";
import type { LprRegion, VehicleColor, VehicleGroup } from "./masterdata.service";


// ✅ payload ตอน create/update
export interface VehiclePayload {
    uid?: string;
    plate_prefix: string;
    plate_number: string;
    region_code: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_color_id: number | null;
    active: boolean;
    visible: boolean;
    notes: string;
    vehicle_group_id: number | null;
    creator_uid: string;
    updater_uid: string;
}

// ✅ data object ของ vehicle
export interface Vehicle {
    uid: string;
    plate_prefix: string;
    plate_number: string;
    region_code: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_color_id: number;
    active: boolean;
    visible: boolean;
    notes: string;
    vehicle_group_id: number;
    creator_uid: string;
    updater_uid: string;
    created_at: string;
    updated_at: string;
    region: LprRegion;
    vehicle_color: VehicleColor;
    vehicle_group: VehicleGroup;
}

// ✅ filter ที่ส่งไป แนะนำใช้ชื่อ key ชัดเจนสำหรับ date ช่วงเวลา
export type VehicleListFilter = Partial<{
    plate_prefix: string;
    plate_number: string;
    region_code: string;
    vehicle_make: string;
    vehicle_color_id: number;
    vehicle_group_id: number;
    // created_at ช่วงเวลา
    created_at_start: string; // ISO string (startOf day)
    created_at_end: string; // ISO string (endOf day)
}>;

export const VehicleApi = {
    // 👉 Create
    create: async (payload: VehiclePayload): Promise<ApiResponse<Vehicle>> => {
        const url = `/smartgate-api/v0/vehicles/create`;
        const res = await http.post<ApiResponse<Vehicle>>(url, payload);
        return res.data;
    },

    // 👉 Update
    update: async (payload: VehiclePayload): Promise<ApiResponse<Vehicle>> => {
        const url = `/smartgate-api/v0/vehicles/update/`;
        const res = await http.put<ApiResponse<Vehicle>>(url, payload);
        return res.data;
    },

    // 👉 Get by id
    getById: async (uid: string): Promise<ApiResponse<Vehicle>> => {
        const url = `/smartgate-api/v0/vehicles/${uid}`;
        const res = await http.get<ApiResponse<Vehicle>>(url);
        return res.data;
    },

    // ✅ Get list with orderBy, limit, page, filter
    list: async (
        page: number = 1,
        limit: number = 20,
        orderBy: string = "uid.asc",
        filter?: VehicleListFilter
    ): Promise<ApiResponse<Vehicle[]>> => {
        const params = new URLSearchParams();
        params.set("orderBy", orderBy);
        params.set("limit", String(limit));
        params.set("page", String(page));

        if (filter) {
            const clean: Record<string, any> = {};
            Object.entries(filter).forEach(([k, v]) => {
                if (v !== null && v !== undefined && v !== "") clean[k] = v;
            });

            if (Object.keys(clean).length > 0) {
                const filterStr = Object.entries(clean)
                    .map(([key, value]) => {
                        if (key === "plate_prefix" || key === "plate_number") {
                            return `${key}~${value}*`; // ✅ ใช้ ~
                        }
                        if (key === "created_at_start") {
                            return `created_at>=${value}`; // ✅ start
                        }
                        if (key === "created_at_end") {
                            return `created_at<=${value}`; // ✅ end
                        }
                        return `${key}=${value}`; // ค่าอื่นใช้ =
                    })
                    .join("&&");

                params.set("filter", filterStr);
            }
        }

        const url = `/smartgate-api/v0/vehicles/get?${params.toString()}`;
        const res = await http.get<ApiResponse<Vehicle[]>>(url);
        return res.data;
    },


    // 👉 Delete
    delete: async (uid: string): Promise<ApiResponse<null>> => {
        const url = `/smartgate-api/v0/vehicles/delete?uids=${uid}`;
        const res = await http.delete<ApiResponse<null>>(url);
        return res.data;
    },
};

export default VehicleApi;
