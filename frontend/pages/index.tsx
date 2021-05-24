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

type JobPropsWithoutRemove = Omit<JobProps, "onRemoval">;

interface JobsDatasetProps {
    data: JobPropsWithoutRemove[];
}

class JobsDataset extends React.Component<JobsDatasetProps & { BACKEND_API: string }, JobsDatasetProps> {
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
                        BACKEND_API={this.props.BACKEND_API}
                    />
                ))}
            </div>
        );
    }
}

interface PageProps {
    BACKEND_API?: string;
}

interface PageState {
    loading: boolean;
    loadedData: JobPropsWithoutRemove[];
    firstLoad: boolean;
}

export default class MainHomePage extends React.Component<PageProps, PageState> {
    INTERVAL: number;
    intTimer?: NodeJS.Timeout;
    constructor(props) {
        super(props);
        this.INTERVAL = 60 * 1000;
        this.fetchData = this.fetchData.bind(this);
        this.state = {
            loading: true,
            loadedData: [],
            firstLoad: true,
        };
    }

    async fetchData() {
        this.setState({ ...this.state, loading: true });
        console.info("Fetching new data...");
        const { BACKEND_API } = this.props;
        try {
            const response = await axios.get(`${BACKEND_API}/api/jobs`);
            this.setState({ loadedData: response.data.data, loading: false });
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

    componentWillUnmount() {
        if (this.intTimer) {
            clearInterval(this.intTimer);
        }
    }

    render() {
        const { loading, firstLoad, loadedData } = this.state;
        const { BACKEND_API } = this.props;

        function renderLoadingState() {
            if (loading && firstLoad) {
                // replace with skeleton
                return (
                    <div className="flex flex-col grid-cols-1 gap-10 pb-8">
                        <JobCardSkeleton />
                        <JobCardSkeleton />
                    </div>
                );
            } else if (loading) {
                return (
                    <>
                        <JobsDataset data={loadedData} BACKEND_API={BACKEND_API} />
                        <BaseContainer>
                            <div className="mt-2 mb-6 text-lg font-bold text-gray-300 animate-pulse">
                                Refreshing...
                            </div>
                        </BaseContainer>
                    </>
                );
            }
            return <JobsDataset data={loadedData} BACKEND_API={BACKEND_API} />;
        }

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>Jobs :: VTHell WebUI</title>
                    <MetadataHead.SEO />
                    <MetadataHead.Prefetch BACKEND_API={BACKEND_API} />
                </Head>
                <Navbar />
                <main className="antialiased h-full pb-4">
                    <BaseContainer className="flex flex-col gap-4 mt-8 mb-6">
                        <span className="text-2xl font-bold">Jobs</span>
                        <hr className="opacity-60" />
                    </BaseContainer>
                    {renderLoadingState()}
                    <Footer />
                </main>
                <BackToTop startAt={100} />
            </>
        );
    }
}

export async function getStaticProps() {
    return {
        props: {
            BACKEND_API: process.env.NEXT_PUBLIC_BACKEND_API_URL,
        },
    };
}
