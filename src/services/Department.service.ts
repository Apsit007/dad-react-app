import type { ApiResponse } from "./ApiResponse";
import http from "./http";


export interface Department {
    uid?: string;
    dep_id: number;
    dep_name: string;
    location: string;
    floor: string;
    notes: string;
    active: boolean;
    visible: boolean;
}


export const DepartmentApi = {
    // 👉 list departments (มี pagination + orderBy)
    list: async (
        page: number = 1,
        limit: number = 20,
        orderBy: string = "uid.asc"
    ): Promise<ApiResponse<Department[]>> => {
        const params = new URLSearchParams();
        params.set("orderBy", orderBy);
        params.set("limit", String(limit));
        params.set("page", String(page));

        const url = `/smartgate-api/v0/departments/get?${params.toString()}`;
        const res = await http.get<ApiResponse<Department[]>>(url);
        return res.data;
    },

    // 👉 create
    create: async (data: Omit<Department, "uid" | "dep_id">) => {
        const url = `/smartgate-api/v0/departments/create`;
        const res = await http.post<ApiResponse<Department>>(url, data);
        return res.data;
    },

    // 👉 update
    update: async (uid: string, data: Partial<Department>) => {
        const url = `/smartgate-api/v0/departments/update`;
        const res = await http.put<ApiResponse<Department>>(url, data);
        return res.data;
    },

    remove: async (uid: string) => {
        const url = `/smartgate-api/v0/departments/delete?uids=${uid}`;
        const res = await http.delete<ApiResponse<null>>(url);
        return res.data;
    },
};
