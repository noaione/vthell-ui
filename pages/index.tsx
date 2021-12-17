import BackTopTop from "@/components/BackToTop";
import BaseContainer from "@/components/BaseContainer";
import JobCard from "@/components/JobCard";
import Navbar from "@/components/Navbar";
import { VTHellJob } from "@/lib/model";
import { RootState } from "@/lib/store";
import VTHellWebsocket from "@/lib/ws";
import Head from "next/head";
import React from "react";
import { connect, ConnectedProps } from "react-redux";

import config from "../config";

const mapDispatch = {
    resetState: () => ({ type: "jobs/resetState" }),
    addJobs: (payload: VTHellJob[]) => ({ type: "jobs/addJobs", payload }),
    addJob: (payload: VTHellJob) => ({ type: "jobs/addJob", payload }),
    updateJob: (payload: VTHellJob) => ({ type: "jobs/updateJob", payload }),
    removeJob: (payload: string) => ({ type: "jobs/removeJob", payload }),
};
const mapStateToProps = (state: RootState) => {
    return state.jobs;
};
const connector = connect(mapStateToProps, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface State {
    isLoading: boolean;
}

export class VTHellHomepage extends React.Component<PropsFromRedux, State> {
    ws?: VTHellWebsocket;

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    async componentDidMount() {
        this.ws = new VTHellWebsocket(config.ws_url);
        this.props.resetState();
        this.ws.on("connect_job_init", (allJobs: VTHellJob[]) => {
            this.props.addJobs(allJobs);
            this.setState({ isLoading: false });
        });
        this.ws.on("job_update", (job: VTHellJob) => {
            if (["DONE", "CLEANING"].includes(job.status)) {
                this.props.removeJob(job.id);
            } else {
                this.props.updateJob(job);
            }
        });
        this.ws.on("job_scheduled", (job: VTHellJob) => {
            this.props.addJob(job);
        });
        this.ws.on("job_delete", (job: Pick<VTHellJob, "id">) => {
            this.props.removeJob(job.id);
        });
        this.ws.on("closed", () => {
            this.setState({ isLoading: true }, () => {
                this.props.resetState();
            });
        });
    }

    render(): React.ReactNode {
        const { isLoading } = this.state;
        const { jobs } = this.props;
        return (
            <React.Fragment key="VTHellHomepage">
                <Head>
                    <title>Home :: VTHell API</title>
                </Head>
                <Navbar />
                <main className="h-full pb-4 antialiased">
                    <BaseContainer className="flex flex-col gap-4 mt-8 mb-6">
                        <span className="text-2xl font-bold mx-2">Jobs</span>
                        <hr className="opacity-60 mx-2" />
                    </BaseContainer>
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="dot-flashing"></div>
                        </div>
                    ) : (
                        <>
                            {jobs.length < 1 ? (
                                <div className="text-center pb-8 text-2xl font-light text-gray-300">
                                    No ongoing jobs
                                </div>
                            ) : (
                                <div className="flex flex-col grid-cols-1 gap-10 pb-8">
                                    {jobs.map((job) => {
                                        return <JobCard key={`job-${job.id}`} job={job} />;
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </main>
                <BackTopTop />
            </React.Fragment>
        );
    }
}

export default connector(VTHellHomepage);
