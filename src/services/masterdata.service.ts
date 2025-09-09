import type { ApiResponse } from './ApiResponse';
import http from './http';

export interface LprRegion {
  id: number;
  region_code: string;
  name_en: string;
  name_th: string;
  remark: string;
}
export interface Gate {
  uid: string;
  gate_id: number;
  gate_name: string;
  gate_location: string;
  notes: string;
  active: boolean;
  visible: boolean;
}
export interface VehicleColor {
  id: number;
  color: string;
  color_en: string;
  color_th: string;
  visible: boolean;
  active: boolean;
}
export interface VehicleGroup {
  id: number;
  name_en: string;
  name_th: string;
  active: boolean;
  visible: boolean;
}



// Fetch LPR regions masterdata
export const getLprRegions = async (
  limit = 1000,
): Promise<ApiResponse<LprRegion[]>> => {
  const url = `/smartgate-api/v0/lpr-regions/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<LprRegion[]>;
};

export const getGates = async (
  limit = 1000,
): Promise<ApiResponse<Gate[]>> => {
  const url = `/smartgate-api/v0/gates/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<Gate[]>;
};

export const getVehicleColors = async (
  limit = 1000,
): Promise<ApiResponse<VehicleColor[]>> => {
  const url = `/smartgate-api/v0/vehicle-colors/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<VehicleColor[]>;
};

export const getVehicleGroups = async (
  limit = 1000,
): Promise<ApiResponse<VehicleGroup[]>> => {
  const url = `/smartgate-api/v0/vehicle-groups/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<VehicleGroup[]>;
};
export default {
  getLprRegions,
  getGates,
  getVehicleColors,
  getVehicleGroups
};
