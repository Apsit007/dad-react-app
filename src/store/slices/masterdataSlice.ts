/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../..';
import { getGates, getLprRegions, getVehicleColors, getVehicleGroups, type Gate, type LprRegion, type VehicleColor, type VehicleGroup } from '../../services/masterdata.service';

interface MasterdataState {
  regions: LprRegion[];
  gates: Gate[];
  vehicleColors: VehicleColor[];
  vehicleGroups: VehicleGroup[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: MasterdataState = {
  regions: [],
  gates: [],
  vehicleColors: [],
  vehicleGroups: [],
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

export const fetchGates = createAsyncThunk(
  'masterdata/fetchGates',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await getGates(1000);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Fetch gates failed';
      return rejectWithValue(message);
    }
  },
);
export const fetchVehicleColors = createAsyncThunk(
  'masterdata/fetchVehicleColors',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await getVehicleColors(1000);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Fetch vehicle colors failed';
      return rejectWithValue(message);
    }
  },
);
export const fetchVehicleGroups = createAsyncThunk(
  'masterdata/fetchVehicleGroups',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await getVehicleGroups(1000);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Fetch vehicle groups failed';
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
    // regions
    builder
      .addCase(fetchLprRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLprRegions.fulfilled, (state, action: PayloadAction<LprRegion[]>) => {
        state.loading = false;
        state.regions = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchLprRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch regions failed';
      });

    // gates
    builder
      .addCase(fetchGates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGates.fulfilled, (state, action: PayloadAction<Gate[]>) => {
        state.loading = false;
        state.gates = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchGates.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch gates failed';
      });

    // vehicle colors
    builder
      .addCase(fetchVehicleColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleColors.fulfilled, (state, action: PayloadAction<VehicleColor[]>) => {
        state.loading = false;
        state.vehicleColors = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchVehicleColors.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch vehicle colors failed';
      });

    // vehicle vehicleGroups
    builder
      .addCase(fetchVehicleGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleGroups.fulfilled, (state, action: PayloadAction<VehicleGroup[]>) => {
        state.loading = false;
        state.vehicleGroups = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchVehicleGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch vehicle groups failed';
      });
  },
});

export const { clearMasterdataError } = masterdataSlice.actions;
export default masterdataSlice.reducer;


// Selectors
export const selectRegions = (state: RootState) => state.masterdata.regions;
export const selectGates = (state: RootState) => state.masterdata.gates;
export const selectVehicleColors = (state: RootState) => state.masterdata.colors;
export const selectVehicleGroups = (state: RootState) => state.masterdata.groups;
export const selectMasterdataLoading = (state: RootState) => state.masterdata.loading;
export const selectMasterdataError = (state: RootState) => state.masterdata.error;
