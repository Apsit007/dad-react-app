import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
    accessToken: string | null;
    loading: boolean;
    error: string | null;
    user: {
        uid: string | null;
        username: string | null;
        firstname: string | null;
        lastname: string | null;
        email: string | null;
        image_url: string | null;
        job_position: string | null;
        permissions: any | null;   // 👈 เปลี่ยนจาก JSON -> any
    };
}

// ✅ โหลด token จาก localStorage
const tokenFromStorage = localStorage.getItem('accessToken');

const initialState: AuthState = {
    accessToken: tokenFromStorage,
    loading: false,
    error: null,
    user: {
        uid: null,
        username: null,
        firstname: null,
        lastname: null,
        email: null,
        image_url: null,
        job_position: null,
        permissions: null,
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
                { username, password },
                { withCredentials: true }
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
            state.user = {
                uid: null,
                username: null,
                firstname: null,
                lastname: null,
                email: null,
                image_url: null,
                job_position: null,
                permissions: null,
            };
            localStorage.removeItem('accessToken');
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            localStorage.setItem('accessToken', action.payload);
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
                state.accessToken = action.payload.accessToken; // ✅ API คืน accessToken ตรง root


                state.user = {
                    uid: action.payload.user.uid ?? '',
                    username: action.payload.user.username ?? '',
                    email: action.payload.user.email ?? '',
                    firstname: action.payload.user.firstname ?? '',
                    lastname: action.payload.user.lastname ?? '',
                    image_url: action.payload.user.image_url ?? '',
                    job_position: action.payload.user.job_position ?? '',
                    permissions: action.payload.user.permissions ?? '',
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

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
