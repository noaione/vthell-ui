import React from "react";

import axios from "axios";
import BaseContainer from "./BaseContainer";
import EmbeddableVideo, { PlatformType } from "./EmbeddableVideo";
import Buttons from "./Buttons";
import { Dialog, Transition } from "@headlessui/react";

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
}

interface JobState {
    isDeleting: boolean;
    deleteModal: boolean;
    passBox: string;

    errorModal: boolean;
    errorText: string;
}

export default class JobCard extends React.Component<JobProps, JobState> {
    constructor(props) {
        super(props);
        this.deleteSelf = this.deleteSelf.bind(this);
        this.state = {
            isDeleting: false,
            deleteModal: false,
            passBox: "",
            errorModal: false,
            errorText: "Unknown error",
        };
    }

    async deleteSelf() {
        const { onRemoval } = this.props;
        const bodyFormData = new FormData();
        bodyFormData.append("id", this.props.id);
        bodyFormData.append("passkey", this.state.passBox);
        const { NEXT_PUBLIC_BACKEND_API_URL } = process.env;
        try {
            await axios.delete(`${NEXT_PUBLIC_BACKEND_API_URL}/api/jobs`, {
                data: bodyFormData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            this.setState({ isDeleting: true }, () => {
                setTimeout(() => {
                    onRemoval(this.props.id);
                }, 200);
            });
        } catch (err) {
            if (err.response) {
                const data = err.response.data;
                setTimeout(() => {
                    this.setState({ errorModal: true, errorText: data.message });
                }, 200);
            } else {
                setTimeout(() => {
                    this.setState({ errorModal: true, errorText: err.toString() });
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
                className={`flex ${this.state.isDeleting ? "transition opacity-0 duration-200" : ""}`}
            >
                <BaseContainer className="bg-gray-700">
                    <div className="relative">
                        <EmbeddableVideo
                            id={id}
                            thumbnail={thumb}
                            status={stats.recording ? "live" : "upcoming"}
                            platform={type}
                            url={url}
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
                        >
                            Delete
                        </Buttons>
                        {stats.paused && (
                            <Buttons
                                btnType="warning"
                                className="mx-1"
                                onClick={() => this.setState({ deleteModal: true })}
                            >
                                Reload
                            </Buttons>
                        )}
                        <Transition
                            as={React.Fragment}
                            show={this.state.deleteModal}
                            enter="transition-opacity duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-200 ease-out"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog
                                className="fixed z-20 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 transform"
                                open={this.state.deleteModal}
                                static
                                onClose={() => {
                                    this.setState({ deleteModal: false, passBox: "" });
                                }}
                            >
                                <div className="flex items-center justify-center min-h-screen w-screen">
                                    <Dialog.Overlay className="fixed w-full inset-0 bg-black opacity-60" />
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
                                                    className="form-input bg-gray-500 block w-full mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200"
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
                                            <Buttons autoFocus onClick={this.deleteSelf} btnType="danger">
                                                Delete
                                            </Buttons>
                                        </div>
                                    </div>
                                </div>
                            </Dialog>
                        </Transition>
                    </div>
                </BaseContainer>
                <Transition
                    as={React.Fragment}
                    show={this.state.errorModal}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-200 ease-out"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog
                        className="fixed z-20 top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 transform"
                        open={this.state.errorModal}
                        onClose={() => this.setState({ errorModal: false })}
                    >
                        <div className="flex items-center justify-center min-h-screen w-screen">
                            <Dialog.Overlay className="fixed w-full inset-0 bg-black opacity-60" />
                            <div className="bg-gray-800 z-50 rounded-lg max-w-sm mx-auto px-5 py-5 flex flex-col gap-2">
                                <Dialog.Title className="text-xl font-semibold">
                                    ⚠ An error occured!
                                </Dialog.Title>
                                <Dialog.Description>{this.state.errorText}</Dialog.Description>

                                <div className="flex flex-row gap-2 mt-4 justify-center">
                                    <Buttons autoFocus onClick={() => this.setState({ errorModal: false })}>
                                        Ok
                                    </Buttons>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        );
    }
}
