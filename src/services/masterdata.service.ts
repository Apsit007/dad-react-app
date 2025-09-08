import axios from 'axios';
import type { ApiResponse } from './ApiResponse';

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
  token?: string | null,
): Promise<ApiResponse<LprRegion[]>> => {
  const base = import.meta.env.VITE_API_URL;
  const url = `${base}/smartgate-api/v0/lpr-regions/get?limit=${limit}`;
  const res = await axios.get(url, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
  return res.data as ApiResponse<LprRegion[]>;
};

export default {
  getLprRegions,
};

