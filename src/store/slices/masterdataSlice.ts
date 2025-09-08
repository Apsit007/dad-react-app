import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { getLprRegions, type LprRegion } from '../../services/masterdata.service';

interface MasterdataState {
  regions: LprRegion[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: MasterdataState = {
  regions: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
};

export const fetchLprRegions = createAsyncThunk(
  'masterdata/fetchLprRegions',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await getLprRegions(1000);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Fetch regions failed';
      return rejectWithValue(message);
    }
  },
);

const masterdataSlice = createSlice({
  name: 'masterdata',
  initialState,
  reducers: {
    clearMasterdataError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLprRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchLprRegions.fulfilled,
        (state, action: PayloadAction<LprRegion[]>) => {
          state.loading = false;
          state.regions = action.payload ?? [];
          state.lastFetchedAt = Date.now();
        },
      )
      .addCase(fetchLprRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch regions failed';
      });
  },
});

export const { clearMasterdataError } = masterdataSlice.actions;
export default masterdataSlice.reducer;

// Selectors
export const selectRegions = (state: RootState) => state.masterdata.regions;
export const selectMasterdataLoading = (state: RootState) => state.masterdata.loading;
export const selectMasterdataError = (state: RootState) => state.masterdata.error;
