import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import masterdataReducer from './slices/masterdataSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        masterdata: masterdataReducer,
    },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
