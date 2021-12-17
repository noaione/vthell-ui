import { Action, applyMiddleware, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { composeWithDevTools } from "redux-devtools-extension";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import jobsReducer from "./slices/job";

export const store = configureStore({
    reducer: {
        jobs: jobsReducer,
    },
    // @ts-ignore
    enhancers: (defaults) => {
        // @ts-ignore
        return composeWithDevTools(applyMiddleware(...defaults));
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export const useStoreDispatch = () => useDispatch<AppDispatch>();
export const useStoreSelector: TypedUseSelectorHook<RootState> = useSelector;
