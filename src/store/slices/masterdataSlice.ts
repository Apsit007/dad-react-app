/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { getGates, getLprRegions, getVehicleColors, getVehicleGroups, getVehicleMakes, getMemberGroups, type Gate, type LprRegion, type VehicleColor, type VehicleGroup, type VehicleMake, type MemberGroup, type PersonTitle, getPersonTitles, type Gender } from '../../services/masterdata.service';
import type { RootState } from '..';

interface MasterdataState {
  regions: LprRegion[];
  gates: Gate[];
  vehicleColors: VehicleColor[];
  vehicleGroups: VehicleGroup[];
  vehicleMakes: VehicleMake[];
  memberGroups: MemberGroup[];
  personTitles: PersonTitle[];
  genders: Gender[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: MasterdataState = {
  regions: [],
  gates: [],
  vehicleColors: [],
  vehicleGroups: [],
  vehicleMakes: [],
  memberGroups: [],
  personTitles: [],
  genders: [                       // ✅ fix data
    { id: 1, name_th: 'ชาย', name_en: 'Male' },
    { id: 2, name_th: 'หญิง', name_en: 'Female' },
  ],
  loading: false,
  error: null,
  lastFetchedAt: null,
};

// thunk รวมทั้งหมด
export const fetchAllMasterdata = createAsyncThunk(
  "masterdata/fetchAll",
  async (_: void, { dispatch }) => {
    // เรียก parallel ได้เลย
    await Promise.all([
      dispatch(fetchLprRegions()),
      dispatch(fetchGates()),
      dispatch(fetchVehicleColors()),
      dispatch(fetchVehicleGroups()),
      dispatch(fetchVehicleMakes()),
      dispatch(fetchPersonTitles()),
      dispatch(fetchMemberGroups()),
    ]);
  }
);

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
export const fetchVehicleMakes = createAsyncThunk(
  'masterdata/fetchVehicleMakes',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await getVehicleMakes(1000);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Fetch vehicle makes failed';
      return rejectWithValue(message);
    }
  },
);
export const fetchMemberGroups = createAsyncThunk(
  'masterdata/fetchMemberGroups',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await getMemberGroups(1000);
      return res.data;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Fetch member groups failed';
      return rejectWithValue(message);
    }
  },
);

export const fetchPersonTitles = createAsyncThunk(
  'masterdata/fetchPersonTitles',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await getPersonTitles(1000);
      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Fetch person titles failed';
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

    // vehicle vehicleMakes
    builder
      .addCase(fetchVehicleMakes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleMakes.fulfilled, (state, action: PayloadAction<VehicleMake[]>) => {
        state.loading = false;
        state.vehicleMakes = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchVehicleMakes.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch vehicle makes failed';
      });
    // ✅ member groups
    builder
      .addCase(fetchMemberGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberGroups.fulfilled, (state, action: PayloadAction<MemberGroup[]>) => {
        state.loading = false;
        state.memberGroups = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchMemberGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch member groups failed';
      });
    // person titles
    builder
      .addCase(fetchPersonTitles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonTitles.fulfilled, (state, action: PayloadAction<PersonTitle[]>) => {
        state.loading = false;
        state.personTitles = action.payload ?? [];
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchPersonTitles.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch person titles failed';
      });
  },
});

export const { clearMasterdataError } = masterdataSlice.actions;
export default masterdataSlice.reducer;
export type { MasterdataState };


// Selectors
export const selectRegions = (state: RootState) => state.masterdata.regions;
export const selectGates = (state: RootState) => state.masterdata.gates;
export const selectVehicleColors = (state: RootState) => state.masterdata.vehicleColors;
export const selectVehicleGroups = (state: RootState) => state.masterdata.vehicleGroups;
export const selectVehicleMakes = (state: RootState) => state.masterdata.vehicleMakes;
export const selectMemberGroups = (state: RootState) => state.masterdata.memberGroups;
export const selectPersonTitles = (state: RootState) => state.masterdata.personTitles;
export const selectGenders = (state: RootState) => state.masterdata.genders;

export const selectMasterdataLoading = (state: RootState) => state.masterdata.loading;
export const selectMasterdataError = (state: RootState) => state.masterdata.error;
