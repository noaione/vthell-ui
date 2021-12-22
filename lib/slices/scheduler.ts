import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import { AutoScheduler } from "../model";

interface SchedulerReduxState {
    scheduler: AutoScheduler[];
}

const initialState: SchedulerReduxState = {
    scheduler: [],
};

export const schedulerReducer = createSlice({
    name: "scheduler",
    initialState,
    reducers: {
        addScheduler: (state, action: PayloadAction<AutoScheduler>) => {
            let { scheduler } = state;
            const { payload } = action;
            const isExist = scheduler.findIndex((e) => e.id === payload.id) !== -1;
            if (!isExist) {
                scheduler.push(payload);
                // scheduler = scheduler.sort((a, b) => a.id - b.id);
                scheduler = scheduler.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
                state.scheduler = scheduler;
            }
        },
        addSchedulers: (state, action: PayloadAction<AutoScheduler[]>) => {
            let { scheduler } = state;
            scheduler = scheduler.concat(action.payload);
            scheduler = scheduler.filter((i, idx) => scheduler.findIndex((op) => op.id === i.id) === idx);
            scheduler = scheduler.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
            state.scheduler = scheduler;
        },
        removeScheduler: (state, action: PayloadAction<number>) => {
            let { scheduler } = state;
            const { payload } = action;
            scheduler = scheduler.filter((e) => payload !== e.id);
            scheduler = scheduler.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
            state.scheduler = scheduler;
        },
        updateScheduler: (state, action: PayloadAction<AutoScheduler>) => {
            let { scheduler } = state;
            const { payload } = action;
            const idx = scheduler.findIndex((e) => e.id === payload.id);
            if (idx !== -1) {
                const s = scheduler[idx];
                for (const key in payload) {
                    if (["id"].includes(key)) {
                        continue;
                    }
                    s[key] = payload[key];
                }
                scheduler[idx] = s;
                scheduler = scheduler.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
                state.scheduler = scheduler;
            }
        },
        resetState: (state) => {
            state.scheduler = [];
        },
    },
});

export const { addScheduler, addSchedulers, removeScheduler, updateScheduler, resetState } =
    schedulerReducer.actions;
export const getAllSchedulers = (state: RootState) => state.scheduler.scheduler;

export default schedulerReducer.reducer;
