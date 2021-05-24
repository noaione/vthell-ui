import React from "react";
import Head from "next/head";

import axios from "axios";
import { decorators, Treebeard, TreeNode } from "react-treebeard-ts";
import SearchIcon from "@heroicons/react/outline/SearchIcon";

import Navbar from "../components/Navbar";
import NodeViewer from "../components/NodeViewer";
import TreeHeader from "../components/TreeHeader";

import { expandFilteredNodes, filterTree, NodeTree } from "../lib/filter";
import { humanizeBytes, parseUnix } from "../lib/utils";

interface RecordsPageState {
    data: NodeTree;
    originalData: NodeTree;
    size: number;
    lastUpdate: number;
    isLoading: boolean;
    searchStr?: string;
    cursor?: NodeTree;
    active?: boolean;
}

async function fetchData() {
    console.info("Fetching records data...");
    const { NEXT_PUBLIC_BACKEND_API_URL } = process.env;
    try {
        const response = await axios.get(`${NEXT_PUBLIC_BACKEND_API_URL}/api/records`);
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
            isLoading: true,
            searchStr: "",
        };
    }

    async componentDidMount() {
        const fetched = await fetchData();
        if (Object.keys(fetched).length > 0) {
            this.setState({
                data: fetched.data,
                originalData: fetched.data,
                size: fetched.size,
                lastUpdate: fetched.lastUpdate,
                isLoading: false,
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
        const { data, cursor, isLoading } = this.state;
        const { NEXT_PUBLIC_BACKEND_API_URL } = process.env;
        const URL_BACKEND = new URL(NEXT_PUBLIC_BACKEND_API_URL);

        return (
            <>
                <Head>
                    <title>Records :: VTHell WebUI</title>
                    <link rel="preconnect" href={URL_BACKEND.origin} />
                    <link rel="preconnect" href="https://i.ytimg.com" />
                </Head>
                <Navbar mode="records" />
                <main>
                    <div className="pt-5 pr-5 pb-0 pl-5">
                        <label className="flex flex-row gap-0">
                            <span className="bg-gray-600 border border-r-0 border-gray-500 p-3 items-center">
                                <SearchIcon className=" w-6 h-6 items-center " />
                            </span>
                            <input
                                className="form-input w-screen py-3 bg-gray-700 text-white"
                                placeholder="Search for..."
                                type="text"
                                onChange={this.onKeyUpSearch}
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
                                data={data as TreeNode}
                                onToggle={this.onToggled}
                                decorators={{ ...decorators, Header: TreeHeader }}
                            />
                        )}
                    </div>
                    <div className="w-full block md:w-1/2 md:inline-block align-top p-5">
                        <NodeViewer node={cursor} />
                        <div className="min-h-full text-sm whitespace-pre-wrap bg-gray-700 text-gray-100 p-5 mt-5">
                            <h2 className="text-xl font-semibold">Usage Information</h2>
                            {!isLoading ? (
                                <>
                                    <p>
                                        <span className="font-semibold">Size:</span>{" "}
                                        {humanizeBytes(this.state.size)}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Last Modified:</span>{" "}
                                        {parseUnix(this.state.lastUpdate)}
                                    </p>
                                    <p className="mt-2 font-semibold text-lg">Disclaimer</p>
                                    <p>
                                        This page doesn&apos;t provide any Download link for them, please
                                        check here{" "}
                                        <a
                                            className="text-blue-400 hover:text-blue-500"
                                            href="https://vthell.ihateani.me/0:/"
                                        >
                                            vthell.ihateani.me
                                        </a>
                                    </p>
                                </>
                            ) : (
                                <p className="font-semibold animate-pulse">Loading...</p>
                            )}
                        </div>
                    </div>
                </main>
            </>
        );
    }
}
