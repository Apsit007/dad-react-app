import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import masterdataReducer from './slices/masterdataSlice';
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// === persist configs ===
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['accessToken', 'user'],
};

const masterdataPersistConfig = {
    key: 'masterdata',
    storage,
    whitelist: [
        'regions',
        'gates',
        'vehicleColors',
        'vehicleGroups',
        'vehicleMakes',
        'genders',
        'personTitles',
        'memberGroups',
    ],
};

// === wrap reducers ===
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedMasterdataReducer = persistReducer(masterdataPersistConfig, masterdataReducer);

// === configure store ===
export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        masterdata: persistedMasterdataReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
