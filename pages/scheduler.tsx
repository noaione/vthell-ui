import React, { useEffect } from "react";
import { withSessionSSR } from "@/lib/session";
import { InferGetServerSidePropsType } from "next";
import { AutoScheduler } from "@/lib/model";
import { connect, ConnectedProps } from "react-redux";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";
import AutoSchedulerAdd from "@/components/AutoScheduler/Add";
import AutoSchedulerManager from "@/components/AutoScheduler/Manager";
import ToastManager from "@/components/ToastManager";
import axios from "axios";
import { buildPath, isNone } from "@/lib/utils";

export const getServerSideProps = withSessionSSR(async ({ req }) => {
    // @ts-ignore
    const user = req.session.user;
    if (!user) {
        return { props: { loggedIn: false } };
    }

    if (user.isLoggedIn) {
        return { props: { loggedIn: true } };
    }
    if (user.user !== "admin") {
        return { props: { loggedIn: false } };
    }

    return { props: { loggedIn: true } };
});

type InferedSSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const mapDispatch = {
    resetState: () => ({ type: "scheduler/resetState" }),
    bulkSchedulers: (payload: AutoScheduler[]) => ({ type: "scheduler/addSchedulers", payload }),
    addScheduler: (payload: AutoScheduler) => ({ type: "scheduler/addScheduler", payload }),
    updateScheduler: (payload: AutoScheduler) => ({ type: "scheduler/updateScheduler", payload }),
    removeScheduler: (payload: number) => ({ type: "scheduler/removeScheduler", payload }),
};

const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

function TripleDotLoading() {
    const [dotState, setDotState] = React.useState(0);
    useEffect(() => {
        setInterval(() => {
            setDotState((dotState) => (dotState + 1) % 3);
        }, 500);
    }, []);

    let dots = "";
    for (let i = 0; i < dotState + 1; i++) {
        dots += ".";
    }

    return <span>Loading{dots}</span>;
}

interface State {
    isLoading: boolean;
}

class AutoSchedulersPage extends React.Component<PropsFromRedux & InferedSSRProps, State> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    toast(text: string, mode: string = "default") {
        const event = new CustomEvent("toastNotification", {
            detail: { text, mode },
        });
        document.dispatchEvent(event);
    }

    async fetchData(): Promise<AutoScheduler[]> {
        console.info("Fetching scheduler data...");
        const { NEXT_PUBLIC_HTTP_URL } = process.env;
        if (isNone(NEXT_PUBLIC_HTTP_URL)) {
            this.toast("Cannot find the public HTTP url to get scheduler! Contact admin!", "error");
            return [];
        }
        const url = buildPath(NEXT_PUBLIC_HTTP_URL, ["api", "auto-scheduler"]);
        try {
            const response = await axios.get(url);
            const respData = response.data;
            let mergedData: AutoScheduler[] = [];
            mergedData = mergedData.concat(
                respData.exclude.map((item: AutoScheduler) => {
                    item.enabled = false;
                    return item;
                })
            );
            mergedData = mergedData.concat(
                respData.include.map((item: AutoScheduler) => {
                    item.enabled = true;
                    return item;
                })
            );
            mergedData = mergedData.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
            return mergedData;
        } catch (err) {
            console.error(err);
            this.toast("Cannot get scheduler data! Contact admin!", "error");
        }
        return [];
    }

    async componentDidMount() {
        this.props.resetState();
        const schedulers = await this.fetchData();

        this.props.bulkSchedulers(schedulers);
        this.setState({ isLoading: false });
    }

    render(): React.ReactNode {
        const { loggedIn } = this.props;
        const { isLoading } = this.state;
        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>Scheduler :: VTHell WebUI</title>
                    <MetadataHead.SEO
                        title="Scheduler"
                        urlPath="/scheduler"
                        description={`Auto scheduler settings for VTHell.${
                            loggedIn ? "" : " Please login as admin to adjust."
                        }`}
                    />
                </Head>
                <Navbar mode="scheduler" />
                <main className="h-full px-4 antialiased py-3">
                    <h1 className="text-2xl font-bold my-3">Auto Scheduler</h1>
                    {isLoading ? (
                        <p>
                            <TripleDotLoading />
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {loggedIn && <AutoSchedulerAdd />}
                            <AutoSchedulerManager isAdmin={loggedIn} />
                        </div>
                    )}
                </main>
                <ToastManager duration={5000} />
            </>
        );
    }
}

export default connector(AutoSchedulersPage);
