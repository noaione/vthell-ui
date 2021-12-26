import BaseContainer from "@/components/BaseContainer";
import JobCard, { mapStatusFormat } from "@/components/JobCard";
import { ToastType } from "@/components/ToastManager";
import { VTHellJob } from "@/lib/model";
import { RootState } from "@/lib/store";
import { isNone } from "@/lib/utils";
import VTHellWebsocket from "@/lib/ws";
import React from "react";
import { ReactNode } from "react";
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

class HomeContainer extends React.Component<PropsFromRedux, State> {
    ws?: VTHellWebsocket;
    afterDisconnection: boolean;

    constructor(props) {
        super(props);
        this.afterDisconnection = false;
        this.state = {
            isLoading: true,
        };
    }

    toast(message: string, type: ToastType = "default") {
        const event = new CustomEvent("toastNotification", {
            detail: {
                text: message,
                mode: type,
            },
        });
        document.dispatchEvent(event);
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
            const isExist = this.props.jobs.some((j) => j.id === job.id);
            if (isExist) {
                if (["DONE", "CLEANING"].includes(job.status)) {
                    this.props.removeJob(job.id);
                    this.toast(`Job ID ${job.id} has finished!`, "info");
                } else {
                    this.props.updateJob(job);
                    this.toast(`Job ${job.id} status changed to: ${mapStatusFormat(job.status)}`, "info");
                }
            }
        });
        this.ws.on("job_scheduled", (job: VTHellJob) => {
            this.toast(`Added Job ${job.id} to list!`, "info");
            this.props.addJob(job);
        });
        this.ws.on("job_delete", (job: Pick<VTHellJob, "id">) => {
            const isExist = this.props.jobs.some((j) => j.id === job.id);
            if (isExist) {
                this.props.removeJob(job.id);
                this.toast(`Job ID ${job.id} got deleted!`, "info");
            }
        });
        this.ws.on("closed", () => {
            this.toast("Lost connection to WebSocket, reconnecting...", "error");
            this.afterDisconnection = true;
            this.setState({ isLoading: true }, () => {
                this.props.resetState();
            });
        });
    }

    render(): ReactNode {
        const { jobs } = this.props;
        const { isLoading } = this.state;
        return (
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
        );
    }
}

export default connector(HomeContainer);
