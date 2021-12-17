import BackTopTop from "@/components/BackToTop";
import BaseContainer from "@/components/BaseContainer";
import JobCard from "@/components/JobCard";
import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";
import ToastManager, { ToastCallbacks, ToastType } from "@/components/ToastManager";
import { VTHellJob } from "@/lib/model";
import { RootState } from "@/lib/store";
import { isNone } from "@/lib/utils";
import VTHellWebsocket from "@/lib/ws";
import Head from "next/head";
import React from "react";
import { connect, ConnectedProps } from "react-redux";

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
    toastCb?: ToastCallbacks;
    afterDisconnection: boolean;

    constructor(props) {
        super(props);
        this.toast = this.toast.bind(this);
        this.afterDisconnection = false;
        this.state = {
            isLoading: true,
        };
    }

    toast(message: string, type: ToastType = "default") {
        if (this.toastCb) {
            this.toastCb.showToast(message, type);
        }
    }

    async componentDidMount() {
        this.props.resetState();
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
        if (isNone(WS_URL)) {
            this.toast("NEXT_PUBLIC_WS_URL is not defined in the environment", "error");
            return;
        }
        try {
            this.ws = new VTHellWebsocket(WS_URL);
        } catch (e) {
            this.toast("Unable to create WS instance, check console", "error");
            console.error(e);
            return;
        }
        this.ws.on("connect_job_init", (allJobs: VTHellJob[]) => {
            if (this.afterDisconnection) {
                this.afterDisconnection = false;
                this.toast("Reconnected to VTHell Websocket", "info");
            }
            this.props.addJobs(allJobs);
            this.setState({ isLoading: false });
        });
        this.ws.on("job_update", (job: VTHellJob) => {
            if (["DONE", "CLEANING"].includes(job.status)) {
                this.props.removeJob(job.id);
                this.toast(`Job ID ${job.id} has finished!`, "info");
            } else {
                this.props.updateJob(job);
            }
        });
        this.ws.on("job_scheduled", (job: VTHellJob) => {
            this.toast(`Added Job ${job.id} to list!`, "info");
            this.props.addJob(job);
        });
        this.ws.on("job_delete", (job: Pick<VTHellJob, "id">) => {
            this.toast(`Job ID ${job.id} got deleted!`, "info");
            this.props.removeJob(job.id);
        });
        this.ws.on("closed", () => {
            this.toast("Lost connection to WebSocket, reconnecting...", "error");
            this.afterDisconnection = true;
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
                    <MetadataHead.Base />
                    <title>Home :: VTHell API</title>
                    <MetadataHead.SEO />
                    <MetadataHead.Prefetch />
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
                <ToastManager duration={5000} onMounted={(cb) => (this.toastCb = cb)} />
                <BackTopTop />
            </React.Fragment>
        );
    }
}

export default connector(VTHellHomepage);
