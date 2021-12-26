import DynamicDateTime from "@/components/DynamicDateTime";
import SearchIcon from "@/components/Icons/SearchIcon";
import TreeHeader from "@/components/Treebeard/TreeHeader";
import NodeViewer, { countFolderSizesRecurce } from "@/components/Treebeard/Viewer";
import { NodeTree } from "@/lib/model";
import { selectPalmBranch, selectPalmTree } from "@/lib/slices/records";
import { RootState } from "@/lib/store";
import { buildPath, humanizeBytes, isNone } from "@/lib/utils";
import axios from "axios";
import { DateTime } from "luxon";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { decorators, theme, Treebeard, TreeNode } from "react-treebeard-ts";

function ExtraSection() {
    const { NEXT_PUBLIC_ARCHIVE_URL } = process.env;
    const downloadPage = !isNone(NEXT_PUBLIC_ARCHIVE_URL) ? new URL(NEXT_PUBLIC_ARCHIVE_URL) : null;
    return (
        <>
            <p className="mt-2 font-semibold text-lg">Note</p>
            <p>
                This page only shows the file listing of the archive folder/path from VTHell.
                {downloadPage && (
                    <>
                        <br />
                        If you want to download it, please see click this url:{" "}
                        <a
                            className="text-blue-400 hover:text-blue-500"
                            href={downloadPage.href}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {downloadPage.hostname}
                        </a>
                    </>
                )}
            </p>
        </>
    );
}

const mapDispatch = {
    resetState: () => ({ type: "records/resetState" }),
    setTree: (payload: NodeTree) => ({ type: "records/setTree", payload }),
    searchTree: (payload: string) => ({ type: "records/searchTree", payload }),
    setActive: (payload: { node: NodeTree; toggle: boolean }) => ({ type: "records/setActive", payload }),
};

const DEFAULT_NODE: NodeTree = {
    id: "1",
    name: "VTuberHell",
    loading: true,
    type: "folder",
    children: [],
    toggled: true,
};

function countFiles(nodeTree: NodeTree) {
    let fileCount = 0;
    countFolderSizesRecurce(
        nodeTree,
        () => null,
        () => fileCount++
    );
    return fileCount;
}

const mapStateToProps = (state: RootState) => {
    const branchTree = selectPalmBranch(state);
    const palmTree = selectPalmTree(state);
    const { active } = state.records;
    let fileCount = 0;
    if (palmTree) {
        fileCount = countFiles(palmTree);
    }
    return {
        tree: branchTree === null ? DEFAULT_NODE : branchTree,
        cursor: active === null ? DEFAULT_NODE : active,
        fileCount,
    };
};

const connector = connect(mapStateToProps, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface RecordPageState {
    size: number;
    lastUpdate: number;
    searchState: string;
    searchBorderCol: string;
    isLoading: boolean;
}

class RecordsContainer extends React.Component<PropsFromRedux, RecordPageState> {
    debounceTimeout?: number;
    timeoutStart?: NodeJS.Timeout;
    intervalStart?: NodeJS.Timeout;

    constructor(props: PropsFromRedux) {
        super(props);
        this.fetchData = this.fetchData.bind(this);
        this.onToggled = this.onToggled.bind(this);
        this.onKeyUpSearch = this.onKeyUpSearch.bind(this);
        this.state = {
            isLoading: true,
            size: -1,
            lastUpdate: -1,
            searchState: "",
            searchBorderCol: "border-gray-500",
        };
    }

    toast(text: string, mode: string = "default") {
        document.dispatchEvent(new CustomEvent("toastNotification", { detail: { text, mode } }));
    }

    async fetchData(): Promise<{ data: NodeTree | null; lastUpdate: number; size: number }> {
        console.info("Fetching records data...");
        const { NEXT_PUBLIC_HTTP_URL } = process.env;
        if (isNone(NEXT_PUBLIC_HTTP_URL)) {
            this.toast("Cannot find the public HTTP url to get records! Contact admin!", "error");
            return { data: null, lastUpdate: -1, size: -1 };
        }
        const url = buildPath(NEXT_PUBLIC_HTTP_URL, ["api", "records"]);
        try {
            const response = await axios.get(url);
            const respData = response.data;
            return {
                data: respData.data,
                lastUpdate: respData.last_updated,
                size: respData.total_size,
            };
        } catch (err) {
            console.error(err);
            return {
                data: null,
                lastUpdate: -1,
                size: -1,
            };
        }
    }

    async componentDidMount() {
        const { data, lastUpdate, size } = await this.fetchData();
        if (data === null) {
            this.toast("Cannot get records data! Contact admin!", "error");
            return;
        }

        this.props.setTree(data);
        this.setState({ lastUpdate, size, isLoading: false });

        const currentTime = DateTime.utc();
        const nextHour = currentTime.endOf("hour").plus(1);
        const timeDelta = nextHour.diff(currentTime).as("millisecond");
        this.timeoutStart = setTimeout(() => {
            // repeat every 1 hour
            this.intervalStart = setInterval(async () => {
                const { data: newData, lastUpdate: newLastUpdate, size: newSize } = await this.fetchData();
                if (newData === null) {
                    this.toast("Failed to refresh records data! Contact admin!", "error");
                    return;
                }
                this.props.setTree(newData);
                this.setState({ lastUpdate: newLastUpdate, size: newSize });
            }, 3600 * 1000);
        }, timeDelta);
    }

    componentWillUnmount() {
        if (this.intervalStart) {
            clearInterval(this.intervalStart);
        }
        if (this.timeoutStart) {
            clearTimeout(this.timeoutStart);
        }
    }

    onKeyUpSearch({ target: { value } }: React.ChangeEvent<HTMLInputElement>) {
        if (this.state.isLoading) {
            return;
        }
        this.setState({ searchState: value }, () => {
            clearTimeout(this.debounceTimeout);
            // let's do debouncing
            this.debounceTimeout = window.setTimeout(() => {
                this.props.searchTree(value);
            }, 500);
        });
    }

    onToggled(node: NodeTree, toggled: boolean) {
        if (this.props.cursor.loading) {
            toggled = true;
        }
        this.props.setActive({ node, toggle: toggled });
    }

    render(): React.ReactNode {
        const { isLoading, searchState, searchBorderCol } = this.state;

        const {
            tree: { node, base },
        } = theme;
        const NodeBase = node;
        const NodeBaseBase = base;
        NodeBaseBase.backgroundColor = "#262626";

        return (
            <main>
                <div className="pt-5 pr-5 pb-0 pl-5">
                    <label className="flex flex-row gap-0 group">
                        <span className={`bg-gray-600 border border-r-0 ${searchBorderCol} p-3 items-center`}>
                            <SearchIcon
                                className="w-6 h-6 items-center"
                                style={{
                                    color: searchBorderCol === "border-gray-500" ? undefined : "#929292",
                                }}
                            />
                        </span>
                        <input
                            className="form-input w-screen py-3 bg-gray-700 text-white"
                            placeholder="Search for..."
                            onFocus={() =>
                                this.setState({ searchBorderCol: "border-blue-600 shadow-helper" })
                            }
                            onBlur={() => this.setState({ searchBorderCol: "border-gray-500" })}
                            type="text"
                            onChange={this.onKeyUpSearch}
                            value={searchState}
                        />
                    </label>
                </div>
                <div className="w-full block md:w-1/2 md:inline-block align-top p-5 treeboard-main">
                    {isLoading ? (
                        <div className="text-center text-2xl font-light text-gray-300 animate-pulse">
                            <p>Loading data...</p>
                        </div>
                    ) : (
                        <Treebeard
                            data={this.props.tree as TreeNode}
                            onToggle={this.onToggled}
                            decorators={{ ...decorators, Header: TreeHeader }}
                            style={{
                                tree: {
                                    node: { ...NodeBase, activeLink: { background: "#353535" } },
                                    base: NodeBaseBase,
                                },
                            }}
                        />
                    )}
                </div>
                <div className="w-full block md:w-1/2 md:inline-block align-top p-5">
                    <NodeViewer node={this.props.cursor} />
                    <div className="min-h-full text-sm whitespace-pre-wrap bg-gray-700 text-gray-100 p-5 mt-5">
                        <h2 className="text-xl font-semibold">Usage Information</h2>
                        <p>
                            <span className="font-semibold">Total Sizes:</span>{" "}
                            {isLoading ? (
                                <span className="animate-pulse">Loading...</span>
                            ) : (
                                <>{humanizeBytes(this.state.size)}</>
                            )}
                        </p>
                        <p>
                            <span className="font-semibold">Total Files:</span>{" "}
                            {isLoading ? (
                                <span className="animate-pulse">Loading...</span>
                            ) : (
                                <>{this.props.fileCount.toLocaleString()} files</>
                            )}
                        </p>
                        <p>
                            <span className="font-semibold">Last Modified:</span>{" "}
                            {isLoading ? (
                                <span className="animate-pulse">Loading...</span>
                            ) : (
                                <DynamicDateTime unix={this.state.lastUpdate} />
                            )}
                        </p>
                        <ExtraSection />
                    </div>
                </div>
            </main>
        );
    }
}

export default connector(RecordsContainer);
