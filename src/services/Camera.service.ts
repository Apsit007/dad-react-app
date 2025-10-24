// src/services/Camera.service.ts
import http from "./http";
import type { ApiResponse } from "./ApiResponse";

export interface Camera {
  camera_uid: string;
  camera_name: string;
  camera_ip: string;
  alpr_camera_id: string;
  gate_uid: string;
  latitude: string;
  longitude: string;
  rtsp_live_url: string;
  rtsp_process_url: string;
  stream_encode_id: number;
  api_server_url: string;
  live_server_url: string;
  live_stream_url: string;
  wsport: number;
  streaming: boolean;
  visible: boolean;
  active: boolean;
  alive: number;
  last_online: string | null;
  last_check: string | null;
  created_at: string;
  updated_at: string;
}

export interface CameraListResponse extends ApiResponse<Camera[]> { }


// เพิ่ม type สำหรับ payload draw-mask
export interface DrawMaskPayload {
  camera_uid: string;
  width: number;
  height: number;
  points: { x: number; y: number }[];
}

export interface DrawMaskResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface LastImageResponse {
  endpoint: string;
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  imageUrl: string;
}

export interface RebootCameraResponse {
  endpoint: string;
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  camera_uid: string;
  rebootIssuedAt: string;
}

export interface GetMaskResponse {
  success: boolean;
  message: string;
  data?: string; // mask image เป็น base64 หรือ URL
}
/**
 * Camera API
 * Example: GET /smartgate-api/v0/cameras/get?page=1&limit=10
 */
export const CameraApi = {
  async getAll(page = 1, limit = 10): Promise<CameraListResponse> {
    const res = await http.get<CameraListResponse>(
      `/smartgate-api/v0/cameras/get?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  async getByUid(uid: string): Promise<ApiResponse<Camera>> {
    const res = await http.get<ApiResponse<Camera>>(
      `/smartgate-api/v0/cameras/get/${uid}`
    );
    return res.data;
  },

  async create(data: Partial<Camera>): Promise<ApiResponse<Camera>> {
    const res = await http.post<ApiResponse<Camera>>(
      `/smartgate-api/v0/cameras/create`,
      data
    );
    return res.data;
  },

  async update(uid: string, data: Partial<Camera>): Promise<ApiResponse<Camera>> {
    const res = await http.patch<ApiResponse<Camera>>(
      `/smartgate-api/v0/cameras/update/${uid}`,
      data
    );
    return res.data;
  },

  async delete(uid: string): Promise<ApiResponse<null>> {
    const res = await http.delete<ApiResponse<null>>(
      `/smartgate-api/v0/cameras/delete/${uid}`
    );
    return res.data;
  },

  async drawMask(payload: DrawMaskPayload): Promise<DrawMaskResponse> {
    const res = await http.post<DrawMaskResponse>(
      `/smartgate-api/v0/cameras/draw-mask`,
      payload
    );
    return res.data;
  },

  async getLastImage(camera_uid: string): Promise<LastImageResponse> {
    const res = await http.get<LastImageResponse>(
      `/smartgate-api/v0/cameras/last-image?camera_uid=${camera_uid}`
    );
    return res.data;
  },

  async rebootCamera(camera_uid: string): Promise<RebootCameraResponse> {
    const res = await http.post<RebootCameraResponse>(
      '/smartgate-api/v0/cameras/reboot-engine',
      { camera_uid } // ✅ ส่งใน body แทน query string
    );
    return res.data;
  },

  async getMask(camera_uid: string): Promise<GetMaskResponse> {
    const res = await http.get<GetMaskResponse>(
      `/smartgate-api/v0/cameras/get-mask?camera_uid=${camera_uid}`
    );
    return res.data;
  }
};
