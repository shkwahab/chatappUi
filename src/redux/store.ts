import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authSlice from "@/redux/slices/auth-slice";
import groupSlice from "@/redux/slices/group-slice";
import sessionExpiry from "@/redux/sessionExpiry";


const rootReducer = combineReducers({
    authCtx: authSlice,
    groups: groupSlice
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['authCtx','groups']
}
const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sessionExpiry)
})

export default store

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch


