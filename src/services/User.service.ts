import type { ApiResponse } from "./ApiResponse";
import http from "./http";

export interface User {
    uid: string;
    username: string;
    password?: string;
    title: string;
    gender: string;
    firstname: string;
    lastname: string;
    idcard: string;
    dob: string;
    phone: string;
    email: string;
    organization: string;
    job_position: string;
    emp_card_id: string;
    image_url: string | null;
    permissions: Record<string, unknown> | string | null;
    user_status: string;
    notes: string;
    tokens?: string;
    is_logged_in: boolean;
    last_login: string | null;
    active: boolean;
    visible: boolean;
    deleted: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export type UserListFilter = Partial<{
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    organization: string;
    user_status: string;
    active: boolean;
    visible: boolean;
    deleted: boolean;
}>;

export type UserListResponse = ApiResponse<User[]>;

export type CreateUserPayload = Partial<Omit<User, "uid" | "created_at" | "updated_at" | "is_logged_in" | "last_login">>;

export type UpdateUserPayload = Partial<Omit<User, "created_at" | "updated_at" | "is_logged_in" | "last_login">> & {
    uid: string;
};

const USER_ENDPOINT = "/smartgate-api/v0/users";
const SEARCHABLE_FIELDS = new Set(["username", "firstname", "lastname", "email", "organization"]);

const buildFilterString = (filter?: UserListFilter): string => {
    const clauses: string[] = ["deleted=false"];

    if (!filter) {
        return clauses.join("&&");
    }

    Object.entries(filter).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) {
                return;
            }

            if (SEARCHABLE_FIELDS.has(key)) {
                clauses.push(`${key}~${trimmed}*`);
            } else {
                clauses.push(`${key}=${trimmed}`);
            }
            return;
        }

        clauses.push(`${key}=${value}`);
    });

    return clauses.join("&&");
};

export interface UserListParams {
    page?: number;
    limit?: number;
    orderBy?: string;
    filter?: UserListFilter;
}

export const UserApi = {
    list: async ({
        page = 1,
        limit = 10,
        orderBy = "uid.asc",
        filter,
    }: UserListParams = {}): Promise<UserListResponse> => {
        const params = new URLSearchParams();
        params.set("orderBy", orderBy);
        params.set("limit", String(limit));
        params.set("page", String(page));
        params.set("filter", buildFilterString(filter));

        const url = `${USER_ENDPOINT}/get?${params.toString()}`;
        const res = await http.get<UserListResponse>(url);
        return res.data;
    },

    getByUid: async (uid: string, lastOnly: boolean = true): Promise<UserListResponse> => {
        const params = new URLSearchParams();
        params.set("last_only", String(lastOnly));
        params.set("filter", `uid=${uid}`);

        const url = `${USER_ENDPOINT}/get?${params.toString()}`;
        const res = await http.get<UserListResponse>(url);
        return res.data;
    },

    create: async (payload: CreateUserPayload): Promise<ApiResponse<User>> => {
        const url = `${USER_ENDPOINT}/create`;
        const res = await http.post<ApiResponse<User>>(url, payload);
        return res.data;
    },

    update: async (payload: UpdateUserPayload): Promise<ApiResponse<User>> => {
        const url = `${USER_ENDPOINT}/update`;
        const res = await http.patch<ApiResponse<User>>(url, payload);
        return res.data;
    },

    remove: async (uids: string | string[]): Promise<ApiResponse<null>> => {
        const uidList = Array.isArray(uids) ? uids.join(",") : uids;
        const url = `${USER_ENDPOINT}/delete?uids=${uidList}`;
        const res = await http.delete<ApiResponse<null>>(url);
        return res.data;
    },
};

export default UserApi;
