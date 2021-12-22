import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import { VTHellJob } from "../model";
import { isNone } from "../utils";

interface JobReduxState {
    jobs: VTHellJob[];
}

const initialState: JobReduxState = {
    jobs: [],
};

export const jobsReducer = createSlice({
    name: "jobs",
    initialState,
    reducers: {
        addJob: (state, action: PayloadAction<VTHellJob>) => {
            let { jobs } = state;
            const { payload } = action;
            const isExist = jobs.findIndex((e) => e.id === payload.id) !== -1;
            if (!isExist) {
                jobs.push(payload);
                jobs = jobs.sort((a, b) => a.start_time - b.start_time);
                state.jobs = jobs;
            }
        },
        addJobs: (state, action: PayloadAction<VTHellJob[]>) => {
            let { jobs } = state;
            jobs = jobs.concat(action.payload);
            jobs = jobs.filter((i, idx) => jobs.findIndex((op) => op.id === i.id) === idx);
            jobs = jobs.sort((a, b) => a.start_time - b.start_time);
            state.jobs = jobs;
        },
        removeJob: (state, action: PayloadAction<string>) => {
            let { jobs } = state;
            const { payload } = action;
            jobs = jobs.filter((e) => payload !== e.id);
            jobs = jobs.sort((a, b) => a.start_time - b.start_time);
            state.jobs = jobs;
        },
        removeJobs: (state, action: PayloadAction<string[]>) => {
            let { jobs } = state;
            const { payload } = action;
            jobs = jobs.filter((e) => !payload.includes(e.id));
            jobs = jobs.sort((a, b) => a.start_time - b.start_time);
            state.jobs = jobs;
        },
        resetState: (state) => {
            state.jobs = [];
        },
        updateJob: (state, action: PayloadAction<VTHellJob>) => {
            const { jobs } = state;
            const { payload } = action;
            const idx = jobs.findIndex((e) => e.id === payload.id);
            if (idx !== -1) {
                const job = jobs[idx];
                job.status = payload.status;
                if (!isNone(payload.error)) {
                    job.error = payload.error;
                }
                for (const key in payload) {
                    if (["id", "status", "error"].includes(key)) {
                        continue;
                    }
                    job[key] = payload[key];
                }
                jobs[idx] = job;
                state.jobs = jobs;
            }
        },
    },
});

export const { addJob, addJobs, removeJob, removeJobs, resetState } = jobsReducer.actions;
export const selectAllJobs = (state: RootState) => state.jobs.jobs;

export default jobsReducer.reducer;
