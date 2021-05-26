import React from "react";

import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";

import BaseContainer from "./BaseContainer";
import Buttons from "./Buttons";
import EmbeddableVideo, { PlatformType } from "./EmbeddableVideo";
import { ToastType } from "./ToastNotification";

interface StatsJobProps {
    member?: boolean;
    recording: boolean;
    recorded: boolean;
    paused: boolean;
}

export interface JobProps {
    id: string;
    title: string;
    url: string;
    streamer: string;
    stats: StatsJobProps;
    thumb: string;
    type: PlatformType;
    startTimeJS: string;
    onRemoval: (id: string) => void;
    callToast: (text: string, mode: ToastType) => void;
}

interface JobState {
    isDeleting: boolean;
    deleteModal: boolean;
    passBox: string;
    reloadable: boolean;

    errorModal: boolean;
    errorText: string;

    disableDelete: boolean;
    disableReload: boolean;
}

export default class JobCard extends React.Component<JobProps, JobState> {
    constructor(props) {
        super(props);
        this.deleteSelf = this.deleteSelf.bind(this);
        this.reloadVideo = this.reloadVideo.bind(this);

        this.state = {
            isDeleting: false,
            deleteModal: false,
            passBox: "",
            errorModal: false,
            errorText: "Unknown error",
            reloadable: this.props.stats.paused,

            disableDelete: false,
            disableReload: false,
        };
    }

    async deleteSelf() {
        if (this.state.disableDelete) {
            return;
        }
        this.setState({ deleteModal: false, disableDelete: true });
        const { onRemoval } = this.props;
        try {
            await axios.delete(`/api/jobs`, {
                data: JSON.stringify({ id: this.props.id, passkey: this.state.passBox }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            this.setState({ isDeleting: true, disableDelete: false }, () => {
                setTimeout(() => {
                    onRemoval(this.props.id);
                }, 200);
            });
        } catch (err) {
            if (err.response) {
                const data = err.response.data;
                setTimeout(() => {
                    this.setState({ errorModal: true, errorText: data.message, disableDelete: false });
                }, 200);
            } else {
                setTimeout(() => {
                    this.setState({ errorModal: true, errorText: err.toString(), disableDelete: false });
                }, 200);
            }
        }
    }

    async reloadVideo() {
        if (this.state.disableReload) {
            return;
        }
        this.setState({ disableReload: true });
        const { callToast, url } = this.props;
        try {
            await axios.put(`/api/jobs`, JSON.stringify({ url }), {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            callToast(`Job ${url} reloaded!`, "info");
            this.setState({ disableReload: false, reloadable: false });
        } catch (err) {
            if (err.response) {
                const data = err.response.data;
                setTimeout(() => {
                    this.setState({ errorModal: true, errorText: data.message, disableReload: false });
                }, 200);
            } else {
                setTimeout(() => {
                    this.setState({ errorModal: true, errorText: err.toString(), disableReload: false });
                }, 200);
            }
        }
    }

    render() {
        const { id, title, url, streamer, stats, thumb, type, startTimeJS } = this.props;

        const parsedStart = new Date(startTimeJS).toString();

        return (
            <div
                id={`job-${id}`}
                className={`flex mx-2 ${this.state.isDeleting ? "transition opacity-0 duration-200" : ""}`}
            >
                <BaseContainer className="bg-gray-700">
                    <div className="relative">
                        <EmbeddableVideo
                            id={id}
                            thumbnail={thumb}
                            status={stats.recording ? "live" : "upcoming"}
                            platform={type}
                            url={url}
                            imageClassName="rounded-t-lg"
                        />
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-700">
                        <p className="mt-1 uppercase tracking-wide font-bold">
                            {stats.member ? "🔐 " : ""}
                            {streamer} • <span className="normal-case">{id}</span>
                            {stats.member ? " • Members-Only" : ""}
                        </p>
                        <p className="mt-2 text-white text-lg font-semibold">{title}</p>
                        <p className="mt-2 ml-1">{parsedStart}</p>
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-800 border-t border-gray-500">
                        <p>
                            <span className="font-bold">Currently Recording?</span>{" "}
                            {stats.recording ? "Yes" : "No"}
                        </p>
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-800 border-t border-gray-500">
                        <p>
                            <span className="font-bold">Stream Recorded?</span>{" "}
                            {stats.recorded ? "Yes" : "No"}
                        </p>
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-800 border-t border-gray-500">
                        <p>
                            <span className="font-bold">Recording Paused?</span> {stats.paused ? "Yes" : "No"}
                        </p>
                    </div>
                    <div className="text-center py-4">
                        <Buttons use="a" href={url} className="mx-1">
                            Watch
                        </Buttons>
                        <Buttons
                            btnType="danger"
                            className="mx-1"
                            onClick={() => this.setState({ deleteModal: true })}
                            disabled={this.state.disableDelete}
                        >
                            Delete
                        </Buttons>
                        {this.state.reloadable && (
                            <Buttons
                                btnType="warning"
                                className="mx-1"
                                onClick={this.reloadVideo}
                                disabled={this.state.disableReload}
                            >
                                Reload
                            </Buttons>
                        )}
                        <Transition as={React.Fragment} show={this.state.deleteModal}>
                            <Dialog
                                as="div"
                                className="fixed z-20 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 transform"
                                open={this.state.deleteModal}
                                static
                                onClose={() => {
                                    this.setState({ deleteModal: false, passBox: "" });
                                }}
                            >
                                <div className="flex items-center justify-center min-h-screen w-screen">
                                    <Transition.Child
                                        as={React.Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0"
                                        enterTo="opacity-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Dialog.Overlay className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-filter backdrop-blur-sm" />
                                    </Transition.Child>

                                    <Transition.Child
                                        as={React.Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <div className="bg-gray-800 z-50 rounded-lg max-w-sm mx-auto px-5 py-5 flex flex-col gap-2">
                                            <Dialog.Title className="text-xl font-semibold">
                                                ⚠ Are you sure?
                                            </Dialog.Title>
                                            <Dialog.Description>
                                                This will permanently delete the jobs
                                            </Dialog.Description>

                                            <div className="mt-2">
                                                <label className="inline-flex flex-col justify-center w-full">
                                                    <span className="text-gray-100 text-sm tracking-wide uppercase">
                                                        Password
                                                    </span>
                                                    <input
                                                        className="form-input bg-gray-600 block w-full mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200"
                                                        type="password"
                                                        value={this.state.passBox}
                                                        onChange={(ev) =>
                                                            this.setState({ passBox: ev.target.value })
                                                        }
                                                        placeholder="**************"
                                                    />
                                                </label>
                                            </div>

                                            <div className="flex flex-row gap-2 mt-4 justify-center">
                                                <Buttons
                                                    onClick={() =>
                                                        this.setState({ deleteModal: false, passBox: "" })
                                                    }
                                                >
                                                    Cancel
                                                </Buttons>
                                                <Buttons onClick={this.deleteSelf} btnType="danger">
                                                    Delete
                                                </Buttons>
                                            </div>
                                        </div>
                                    </Transition.Child>
                                </div>
                            </Dialog>
                        </Transition>
                    </div>
                </BaseContainer>
                <Transition as={React.Fragment} show={this.state.errorModal}>
                    <Dialog
                        as="div"
                        className="fixed z-20 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 transform"
                        open={this.state.errorModal}
                        static
                        onClose={() => {
                            this.setState({ errorModal: false, passBox: "" });
                        }}
                    >
                        <div className="flex items-center justify-center min-h-screen w-screen">
                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Dialog.Overlay className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-filter backdrop-blur-sm" />
                            </Transition.Child>

                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <div className="bg-gray-800 z-50 rounded-lg max-w-sm mx-auto px-5 py-5 flex flex-col gap-2">
                                    <Dialog.Title className="text-xl font-semibold">
                                        ⚠ An error occured!
                                    </Dialog.Title>
                                    <Dialog.Description>{this.state.errorText}</Dialog.Description>

                                    <div className="flex flex-row gap-2 mt-4 justify-center">
                                        <Buttons onClick={() => this.setState({ errorModal: false })}>
                                            Ok
                                        </Buttons>
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        );
    }
}
