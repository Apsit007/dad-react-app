import { Department } from './Department.service';
// src/services/FaceData.service.ts
import http from "./http";
import type { ApiResponse } from "./ApiResponse";

// ---- Interfaces ----
export interface FaceDataMember {
    uid: string;
    hik_pid: string;
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
    image_url: string | null;
    member_status: string;
    notes: string | null;
    creator_uid: string;
    updater_uid: string;
    member_group_id: number;
    card_code: string;
    card_number: string;
    start_date: string;
    end_date: string;
    vehicle_uid_list: string[];
    active: boolean;
    visible: boolean;
    deleted: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
    department_name: string;
}

export interface FaceDataVehicle {
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
    region_name_en: string;
    region_name_th: string;
    vehicle_color_name_en: string;
    vehicle_color_name_th: string;
    vehicle_group_name_en: string;
    vehicle_group_name_th: string;
}

export interface FaceData {
    id: string;
    date_time: string;
    channel_id: number;
    channel_name: string;
    human_id: string;
    blacklist_id: string | null;
    similarity: string;
    face_url: string;
    background_url: string;
    fdlib_url: string;
    member_data: FaceDataMember | null;
    vehicle_data: FaceDataVehicle | null;
    epoch_end: string;
    plate: string;
    plate_prefix: string;
    plate_number: string;
    region_code: string;
    region_name_en: string;
    region_name_th: string;
    vehicle_make: string;
    vehicle_make_name_en: string;
    vehicle_make_name_th: string;
    vehicle_model: string;
    vehicle_model_name_en: string;
    vehicle_model_name_th: string;
    vehicle_color: string;
    vehicle_color_name_en: string;
    vehicle_color_name_th: string;
    vehicle_body_type: string;
    vehicle_body_type_name_en: string;
    vehicle_body_type_name_th: string;
    overview_image: string;
    plate_image: string;
    lpr_id: string;
    date_time_in: string;
    date_time_out: string;
    driver_group_name_th: string;

}



export interface FaceDataPagination {
    page: number;
    maxPage: number;
    limit: number;
    count: number;
    countAll: number;
}

export interface FaceDataResponse extends ApiResponse<FaceData[]> {
    pagination: FaceDataPagination;
}

// ---- API Service ----
export const FaceDataApi = {
    search: async (
        params: {
            page?: number;
            limit?: number;
            orderBy?: string;
            firstname?: string;
            lastname?: string;
            member_group_id?: number;
            direction?: string;
            start_date?: string;
            end_date?: string;
        }
    ): Promise<FaceDataResponse> => {
        const res = await http.post<FaceDataResponse>(
            "/smartgate-api/v0/face-data/search",
            params
        );
        return res.data;
    },
};
