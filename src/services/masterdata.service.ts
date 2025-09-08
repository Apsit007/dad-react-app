import type { ApiResponse } from './ApiResponse';
import http from './http';

export interface LprRegion {
  id: number;
  region_code: string;
  name_en: string;
  name_th: string;
  remark: string;
}



// Fetch LPR regions masterdata
export const getLprRegions = async (
  limit = 1000,
): Promise<ApiResponse<LprRegion[]>> => {
  const url = `/smartgate-api/v0/lpr-regions/get?limit=${limit}`;
  const res = await http.get(url);
  return res.data as ApiResponse<LprRegion[]>;
};

export default {
  getLprRegions,
};
