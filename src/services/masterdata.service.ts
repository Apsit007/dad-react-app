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
export interface VehicleMake {
  id: number;
  make: string;
  make_en: string;
  make_th: string;
  visible: boolean;
  active: boolean;
}
export interface VehicleModel {
  id: number;
  make_id: number;
  model: string;
  model_en: string;
  model_th: string;
  visible: boolean;
  active: boolean;
}

export interface MemberGroup {
  id: number;
  name_en: string;
  name_th: string;
  active: boolean;
  visible: boolean;
}

export interface PersonTitle {
  id: number;
  title_group: string;
  title_en: string;
  title_th: string;
  title_abbr_en: string;
  title_abbr_th: string;
  visible: boolean;
  active: boolean;
  remark: string;
}
export interface Gender {
  id: number;
  name_th: string;
  name_en: string;
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
export const getVehicleMakes = async (
  limit = 1000,
): Promise<ApiResponse<VehicleMake[]>> => {
  const url = `/smartgate-api/v0/vehicle-makes/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<VehicleMake[]>;
};

export const getVehicleModels = async (
  make_id: number,
  limit = 1000,
): Promise<ApiResponse<VehicleModel[]>> => {
  const url = `/smartgate-api/v0/vehicle-models/get?limit=${limit}&filter=make_id%20%3D${make_id}`;
  const res = await http.get(url);
  return res.data as ApiResponse<VehicleModel[]>;
};

export const getMemberGroups = async (
  limit = 1000,
): Promise<ApiResponse<MemberGroup[]>> => {
  const url = `/smartgate-api/v0/member-groups/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<MemberGroup[]>;
};

export const getPersonTitles = async (
  limit = 1000,
): Promise<ApiResponse<PersonTitle[]>> => {
  const url = `/smartgate-api/v0/person-titles/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<PersonTitle[]>;
};

export default {
  getLprRegions,
  getGates,
  getVehicleColors,
  getVehicleGroups,
  getVehicleMakes,
  getMemberGroups,
  getPersonTitles,
};
