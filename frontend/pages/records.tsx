import React from "react";
import Head from "next/head";

import axios from "axios";
import { decorators, theme, Treebeard, TreeNode } from "react-treebeard-ts";
import SearchIcon from "@heroicons/react/outline/SearchIcon";

import MetadataHead from "../components/MetadataHead";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import NodeViewer from "../components/NodeViewer";
import TreeHeader from "../components/TreeHeader";

import { expandFilteredNodes, filterTree, NodeTree } from "../lib/filter";
import { humanizeBytes, parseUnix } from "../lib/utils";

function countTotalFilesRecurse(node: NodeTree, cb: (node: NodeTree) => void) {
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === "file") {
            if (typeof cb === "function") {
                cb(child);
            }
        } else if (child.type === "folder") {
            countTotalFilesRecurse(child, cb);
        }
    }
}

interface RecordsPageState {
    data: NodeTree;
    originalData: NodeTree;
    size: number;
    lastUpdate: number;
    totalFiles: number;
    isLoading: boolean;
    searchStr?: string;
    cursor?: NodeTree;
    active?: boolean;

    borderCol?: string;
}

function DisclaimerSection() {
    return (
        <>
            <p className="mt-2 font-semibold text-lg">Disclaimer</p>
            <p>
                This page doesn&apos;t provide any Download link for them, please check here{" "}
                <a className="text-blue-400 hover:text-blue-500" href="https://vthell.ihateani.me/0:/">
                    vthell.ihateani.me
                </a>
                <br />
                <code className="text-green-200">Member-Only Stream Archive</code> are protected with password
                and only available to be seen here and not be downloaded by anyone elses.
            </p>
            <p>
                <b>2021-08-23 Update</b><br />
                All of the archive that I have are currently nuked because my account got disabled.
                If somehow I can recover it, I will turn on again my archive system.
            </p>
        </>
    );
}

async function fetchData() {
    console.info("Fetching records data...");
    try {
        const response = await axios.get(`/api/records`);
        const respData = response.data;
        return {
            data: respData.data,
            lastUpdate: respData.last_updated,
            size: respData.total_size,
        };
    } catch (err) {
        console.error(err);
        return {};
    }
}

export default class RecordsPage extends React.Component<{}, RecordsPageState> {
    constructor(props) {
        super(props);
        this.onKeyUpSearch = this.onKeyUpSearch.bind(this);
        this.onToggled = this.onToggled.bind(this);

        const data: NodeTree = {
            id: 1,
            name: "VTuberHell",
            loading: true,
            type: "folder",
            children: [],
            toggled: true,
        };
        this.state = {
            data,
            originalData: data,
            size: -1,
            lastUpdate: -1,
            totalFiles: -1,
            isLoading: true,
            searchStr: "",
            borderCol: "border-gray-500",
        };
    }

    async componentDidMount() {
        const fetched = await fetchData();
        if (Object.keys(fetched).length > 0) {
            let finalCount = 0;
            const cb = () => (finalCount += 1);
            countTotalFilesRecurse(fetched.data, cb);
            this.setState({
                data: fetched.data,
                originalData: fetched.data,
                size: fetched.size,
                lastUpdate: fetched.lastUpdate,
                totalFiles: finalCount,
                isLoading: false,
                borderCol: "border-gray-500",
            });
        }
    }

    onKeyUpSearch({ target: { value } }: React.ChangeEvent<HTMLInputElement>) {
        if (this.state.isLoading) {
            return;
        }
        const filter = value.trim();
        if (!filter) {
            return this.setState((pre) => ({ data: pre.originalData, searchStr: "" }));
        }
        let filtered = filterTree(this.state.data, filter);
        filtered = expandFilteredNodes(filtered, filter);
        this.setState({ data: filtered, searchStr: value });
    }

    onToggled(node: NodeTree, toggled: boolean) {
        const { cursor, data } = this.state;
        if (cursor) {
            this.setState({ cursor, active: false });
            cursor.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        this.setState({ cursor: node, data: Object.assign({}, data) });
    }

    render() {
        const { data, cursor, isLoading, borderCol } = this.state;

        const {
            tree: { node, base },
        } = theme;
        const NodeBase = node;
        const NodeBaseBase = base;
        NodeBaseBase.backgroundColor = "#262626";

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>Records :: VTHell WebUI</title>
                    <MetadataHead.SEO
                        title="Records"
                        urlPath="/records"
                        description="All recorded past stream listing that are powered by VTHell"
                    />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar mode="records" />
                <main>
                    <div className="pt-5 pr-5 pb-0 pl-5">
                        <label className="flex flex-row gap-0 group">
                            <span className={`bg-gray-600 border border-r-0 ${borderCol} p-3 items-center`}>
                                <SearchIcon
                                    className="w-6 h-6 items-center"
                                    style={{ color: borderCol === "border-gray-500" ? undefined : "#929292" }}
                                />
                            </span>
                            <input
                                className="form-input w-screen py-3 bg-gray-700 text-white"
                                placeholder="Search for..."
                                onFocus={() => this.setState({ borderCol: "border-blue-600 shadow-helper" })}
                                onBlur={() => this.setState({ borderCol: "border-gray-500" })}
                                type="text"
                                onChange={this.onKeyUpSearch}
                            />
                        </label>
                    </div>
                    <div className="w-full block md:w-1/2 md:inline-block align-top p-5 treeboard-main">
                        <div className="text-center text-xl text-gray-300">
                            <p>Archive system is closed.</p>
                        </div>
                    </div>
                    <div className="w-full block md:w-1/2 md:inline-block align-top p-5">
                        <NodeViewer node={cursor} />
                        <div className="min-h-full text-sm whitespace-pre-wrap bg-gray-700 text-gray-100 p-5 mt-5">
                            <h2 className="text-xl font-semibold">Usage Information</h2>
                            {!isLoading ? (
                                <>
                                    <p>
                                        <span className="font-semibold">Total Sizes:</span>{" "}
                                        {humanizeBytes(this.state.size)}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Total Files:</span>{" "}
                                        {this.state.totalFiles.toLocaleString()} files
                                    </p>
                                    <p>
                                        <span className="font-semibold">Last Modified:</span>{" "}
                                        {parseUnix(this.state.lastUpdate)}
                                    </p>
                                    <DisclaimerSection />
                                </>
                            ) : (
                                <>
                                    <p>
                                        <span className="font-semibold">Total Sizes:</span>{" "}
                                        <span className="animate-pulse">Loading...</span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Total Files:</span>{" "}
                                        <span className="animate-pulse">Loading...</span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Last Modified:</span>{" "}
                                        <span className="animate-pulse">Loading...</span>
                                    </p>
                                    <DisclaimerSection />
                                </>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }
}
