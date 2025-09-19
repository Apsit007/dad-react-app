// src/services/Member.service.ts
import type { ApiResponse } from "./ApiResponse";
import http from "./http";
import type { Vehicle } from "./VehicleApi.service";

// ✅ payload ตอน create/update
export interface MemberPayload {
    uid?: string; // optional ตอน create
    title: string;
    gender: string;
    firstname: string;
    lastname: string;
    idcard: string;
    dob: string;
    phone: string;
    email: string;
    dep_uid: string;
    emp_card_id: string;
    image_url: string;
    member_status: string;
    notes: string;
    member_group_id: number;
    card_code: string;
    card_number: string;
    vehicle_uid_list: string;
    active: boolean;
    visible: boolean;
    deleted: boolean;
    creator_uid: string;
    updater_uid: string;
    start_date: string;
    end_date: string;
}

// ✅ data object ของ Member
export interface Member extends MemberPayload {
    uid: string;
    // 👉 ถ้ามี relation object เพิ่มตรงนี้
    // member_group?: MemberGroup
    vehicles: Vehicle[];
}

// ✅ filter สำหรับ list
export type MemberListFilter = Partial<{
    firstname: string;
    lastname: string;
    idcard: string;
    phone: string;
    email: string;
    member_group_id: number;
    created_at_start: string;
    created_at_end: string;
}>;

export const MemberApi = {
    // 👉 Create
    create: async (payload: MemberPayload): Promise<ApiResponse<Member>> => {
        const url = `/smartgate-api/v0/members/create`;
        const res = await http.post<ApiResponse<Member>>(url, payload);
        return res.data;
    },

    // 👉 Update
    update: async (payload: MemberPayload): Promise<ApiResponse<Member>> => {
        const url = `/smartgate-api/v0/members/update`;
        const res = await http.put<ApiResponse<Member>>(url, payload);
        return res.data;
    },

    // 👉 Get by id
    getById: async (uid: string): Promise<ApiResponse<Member[]>> => {
        const url = `/smartgate-api/v0/members/get?filter=uid%3D${uid}`;
        const res = await http.get<ApiResponse<Member[]>>(url);
        return res.data;
    },

    // 👉 Get list
    list: async (
        page: number = 1,
        limit: number = 20,
        orderBy: string = "uid.asc",
        filter?: MemberListFilter
    ): Promise<ApiResponse<Member[]>> => {
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
                        if (key === "firstname" || key === "lastname" || key === "idcard") {
                            return `${key}~${value}*`; // ✅ partial match
                        }
                        if (key === "created_at_start") {
                            return `created_at>=${value}`;
                        }
                        if (key === "created_at_end") {
                            return `created_at<=${value}`;
                        }
                        return `${key}=${value}`;
                    })
                    .join("&&");

                params.set("filter", `${filterStr}&&deleted=false`);
            } else {
                params.set("filter", `deleted=false`);
            }
        }

        const url = `/smartgate-api/v0/members/get?${params.toString()}`;
        const res = await http.get<ApiResponse<Member[]>>(url);
        return res.data;
    },

    // 👉 Delete
    delete: async (uid: string): Promise<ApiResponse<null>> => {
        const url = `/smartgate-api/v0/members/delete?uids=${uid}`;
        const res = await http.delete<ApiResponse<null>>(url);
        return res.data;
    },
    terminate: async (uid: string): Promise<ApiResponse<null>> => {
        const url = `/smartgate-api/v0/members/terminate?uids=${uid}`;
        const res = await http.post<ApiResponse<null>>(url);
        return res.data;
    },
};

export default MemberApi;
