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
        imaage_url: string | null;
        // permissions: Permissions;
    };
}




// ✅ โหลด token จาก localStorage ทันที
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
        imaage_url: null,
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
            state.user = {
                uid: null,
                username: null,
                firstname: null,
                lastname: null,
                email: null,
                imaage_url: null,
            };
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
                    uid: action.payload.uid ?? '',
                    username: action.payload.username ?? '',
                    email: action.payload.email ?? '',
                    firstname: action.payload.firstname ?? '',
                    lastname: action.payload.lastname ?? '',
                    imaage_url: action.payload.imaage_url ?? '',
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
