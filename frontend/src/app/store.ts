import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import { reducer } from "./reducer";

export const store = configureStore({
    reducer: reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }).concat(baseApi.middleware),
});