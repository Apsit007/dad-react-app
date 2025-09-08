import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
    accessToken: string | null;
    loading: boolean;
    error: string | null;
    user: {
        username: string | null;
        email: string | null;
    };
}

// ✅ โหลด token จาก localStorage ทันที
const tokenFromStorage = localStorage.getItem('accessToken');

const initialState: AuthState = {
    accessToken: tokenFromStorage,
    loading: false,
    error: null,
    user: {
        username: null,
        email: null,
    },
};

// 🔹 Async thunk: login
export const login = createAsyncThunk(
    'auth/login',
    async (
        { username, password }: { username: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/smartgate-api/v0/users/login`,
                { username, password }
            );
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Login failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.accessToken = null;
            state.user = { username: null, email: null };
            localStorage.removeItem('accessToken');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.user = {
                    username: action.payload.username ?? 'demo',
                    email: action.payload.email ?? '',
                };
                // ✅ เก็บ token ลง localStorage
                localStorage.setItem('accessToken', action.payload.accessToken);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
