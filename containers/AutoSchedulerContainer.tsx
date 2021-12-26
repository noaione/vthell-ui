import { AutoScheduler } from "@/lib/model";
import { buildPath, isNone } from "@/lib/utils";
import AutoSchedulerAdd from "@/components/AutoScheduler/Add";
import AutoSchedulerManager from "@/components/AutoScheduler/Manager";
import axios from "axios";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import TripleDot from "@/components/TripleDot";

const mapDispatch = {
    resetState: () => ({ type: "scheduler/resetState" }),
    bulkSchedulers: (payload: AutoScheduler[]) => ({ type: "scheduler/addSchedulers", payload }),
};

const connector = connect(null, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface State {
    isLoading: boolean;
}

interface ExtraProps {
    loggedIn: boolean;
}

class AutoSchedulerContainer extends React.Component<PropsFromRedux & ExtraProps, State> {
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
        const { isLoading } = this.state;
        const { loggedIn } = this.props;

        return (
            <main className="h-full px-4 antialiased py-3">
                <h1 className="text-2xl font-bold my-3">Auto Scheduler</h1>
                {isLoading ? (
                    <p>
                        <TripleDot />
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {loggedIn && <AutoSchedulerAdd />}
                        <AutoSchedulerManager isAdmin={loggedIn} />
                    </div>
                )}
            </main>
        );
    }
}

export default connector(AutoSchedulerContainer);
