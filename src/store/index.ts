import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import masterdataReducer from './slices/masterdataSlice';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['accessToken', 'user'],
};


export const store = configureStore({
    reducer: {
        auth: persistReducer(authPersistConfig, authReducer),
        masterdata: masterdataReducer,
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
