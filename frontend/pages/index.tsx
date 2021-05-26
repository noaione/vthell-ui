import React from "react";
import Head from "next/head";

import axios from "axios";

import BackToTop from "../components/BackToTop";
import BaseContainer from "../components/BaseContainer";
import Footer from "../components/Footer";
import JobCard, { JobProps } from "../components/JobCard";
import Navbar from "../components/Navbar";
import JobCardSkeleton from "../components/JobCardSkeleton";
import MetadataHead from "../components/MetadataHead";
import ToastNotification, { ToastCallbacks, ToastType } from "../components/ToastNotification";

type JobPropsWithoutRemove = Omit<JobProps, "onRemoval">;

interface JobsDatasetProps {
    data: JobPropsWithoutRemove[];
}

interface CallbackPropsDataset {
    callToast: (text: string, mode: ToastType) => void;
    onDismiss: (id: string) => void;
}

class JobsDataset extends React.Component<JobsDatasetProps & CallbackPropsDataset, JobsDatasetProps> {
    constructor(props) {
        super(props);
        this.dismissData = this.dismissData.bind(this);

        const { data } = this.props;
        let realData = [];
        if (Array.isArray(data)) {
            realData = data;
        }

        this.state = {
            data: realData,
        };
    }

    dismissData(id: string) {
        let { data } = this.state;
        data = data.filter((e) => e.id !== id);
        this.setState({ data });
        this.props.onDismiss(id);
    }

    render() {
        const { data } = this.state;

        if (data.length < 1) {
            return <div className="text-center pb-8 text-2xl font-light text-gray-300">No ongoing jobs</div>;
        }

        return (
            <div className="flex flex-col grid-cols-1 gap-10 pb-8">
                {data.map((job) => (
                    <JobCard
                        key={`job-${job.id}`}
                        {...job}
                        onRemoval={this.dismissData}
                        callToast={this.props.callToast}
                    />
                ))}
            </div>
        );
    }
}

interface PageState {
    loading: boolean;
    loadedData: JobPropsWithoutRemove[];
    backupData: JobPropsWithoutRemove[];
    firstLoad: boolean;
}

export default class MainHomePage extends React.Component<{}, PageState> {
    INTERVAL: number;
    intTimer?: NodeJS.Timeout;
    toastCb?: ToastCallbacks;

    constructor(props) {
        super(props);
        this.INTERVAL = 60 * 1000;
        this.fetchData = this.fetchData.bind(this);
        this.callToast = this.callToast.bind(this);
        this.onDimissal = this.onDimissal.bind(this);
        this.state = {
            loading: true,
            loadedData: [],
            backupData: [],
            firstLoad: true,
        };
    }

    async fetchData() {
        this.setState({ ...this.state, loading: true });
        console.info("Fetching new data...");
        try {
            const response = await axios.get(`/api/jobs`);
            this.setState({ loadedData: response.data.data, backupData: response.data.data, loading: false });
        } catch (err) {
            console.error(err);
            this.setState({ ...this.state, loading: false });
        }
    }

    componentDidMount() {
        const outerThis = this;
        this.fetchData()
            .then(() => {
                outerThis.setState({ firstLoad: false });
                setTimeout(() => {
                    outerThis.intTimer = setInterval(
                        () =>
                            outerThis
                                .fetchData()
                                .then(() => {
                                    return;
                                })
                                .catch(() => {
                                    return;
                                }),
                        outerThis.INTERVAL
                    );
                }, outerThis.INTERVAL);
            })
            .catch(() => {
                outerThis.setState({ firstLoad: false });
                setTimeout(() => {
                    outerThis.intTimer = setInterval(
                        () =>
                            outerThis
                                .fetchData()
                                .then(() => {
                                    return;
                                })
                                .catch(() => {
                                    return;
                                }),
                        outerThis.INTERVAL
                    );
                }, outerThis.INTERVAL);
            });
    }

    callToast(text: string, mode: ToastType = "default") {
        if (this.toastCb) {
            this.toastCb.showToast(text, mode);
        }
    }

    onDimissal(id: string) {
        let { backupData } = this.state;
        backupData = backupData.filter((e) => e.id !== id);
        this.setState({ backupData });
    }

    componentWillUnmount() {
        if (this.intTimer) {
            clearInterval(this.intTimer);
        }
    }

    render() {
        const { loading, firstLoad, loadedData, backupData } = this.state;

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>Jobs :: VTHell WebUI</title>
                    <MetadataHead.SEO />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar />
                <ToastNotification onMounted={(cb) => (this.toastCb = cb)} />
                <main className="antialiased h-full pb-4">
                    <BaseContainer className="flex flex-col gap-4 mt-8 mb-6">
                        <span className="text-2xl font-bold mx-2">Jobs</span>
                        <hr className="opacity-60 mx-2" />
                    </BaseContainer>
                    {loading && firstLoad ? (
                        <div className="flex flex-col grid-cols-1 gap-10 pb-8">
                            <JobCardSkeleton />
                            <JobCardSkeleton />
                        </div>
                    ) : (
                        <>
                            <JobsDataset
                                data={loading ? backupData : loadedData}
                                callToast={this.callToast}
                                onDismiss={this.onDimissal}
                            />
                            {loading && (
                                <BaseContainer removeShadow>
                                    <div className="-mt-2 mx-2 mb-6 text-lg font-bold text-gray-300 animate-pulse">
                                        Refreshing...
                                    </div>
                                </BaseContainer>
                            )}
                        </>
                    )}
                    <Footer />
                </main>
                <BackToTop startAt={100} />
            </>
        );
    }
}
