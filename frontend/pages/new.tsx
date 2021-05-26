/* eslint-disable no-useless-escape */
import Head from "next/head";
import React from "react";

import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";

import BaseContainer from "../components/BaseContainer";
import Footer from "../components/Footer";
import MetadataHead from "../components/MetadataHead";
import Navbar from "../components/Navbar";
import Buttons from "../components/Buttons";
import EmbeddableVideo, { PlatformType } from "../components/EmbeddableVideo";
import ToastNotification, { ToastCallbacks, ToastType } from "../components/ToastNotification";

interface Callbacks {
    showModal: () => void;
    hideModal: () => void;
    toggleModal: () => void;
    setError: (error: string) => void;
}

interface ModalProps {
    onMounted: (cb: Callbacks) => void;
}

interface ModalState {
    show: boolean;
    errorText: string;
}

class ErrorModal extends React.Component<ModalProps, ModalState> {
    constructor(props) {
        super(props);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.toggle = this.toggle.bind(this);
        this.setError = this.setError.bind(this);
        this.state = {
            show: false,
            errorText: "An unknown error occured",
        };
    }

    setError(error: string) {
        this.setState({ errorText: error });
    }

    showModal() {
        this.setState({ show: true });
    }

    hideModal() {
        this.setState({ show: false });
    }

    toggle() {
        if (this.state.show) {
            this.showModal();
            return;
        }
        this.hideModal();
    }

    componentDidMount() {
        const outerThis = this;
        this.props.onMounted({
            showModal: () => outerThis.showModal(),
            hideModal: () => outerThis.hideModal(),
            toggleModal: () => outerThis.toggle(),
            setError: (err) => outerThis.setError(err),
        });
    }

    render() {
        const { show } = this.state;
        return (
            <Transition show={show} as={React.Fragment}>
                <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={this.hideModal}>
                    <div className="min-h-screen px-4 text-center">
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

                        {/* This element is to trick the browser into centering the modal contents. */}
                        <span className="inline-block h-screen align-middle" aria-hidden="true">
                            &#8203;
                        </span>

                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-xl rounded-2xl">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-4 text-gray-100 flex flex-row justify-between"
                                >
                                    <span>⚠ An Error Occured</span>
                                    <span
                                        className="text-gray-300 hover:text-gray-400 transition cursor-pointer"
                                        onClick={this.hideModal}
                                    >
                                        x
                                    </span>
                                </Dialog.Title>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-200">{this.state.errorText}</p>
                                </div>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-100 bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 transition"
                                        onClick={this.hideModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        );
    }
}

interface PageProps {
    BACKEND_API?: string;
}

interface PageState {
    isSubmitting: boolean;
    isValid: boolean;
    newUrl: string;
    password: string;

    videoId: string;
    videoUrl: string;
    videoPlatform: PlatformType | "unknown";
}

function extractChannelID(channelUrl: string, regex: RegExp) {
    while (true) {
        const res = regex.exec(channelUrl);
        if (res !== null) {
            return res[1];
        }
    }
}

export default class CreateNewJobsPages extends React.Component<PageProps, PageState> {
    errModalCb?: Callbacks;
    toastCb?: ToastCallbacks;

    YOUTUBE_RE: RegExp;
    TWITCH_RE: RegExp;
    TWITCASTING_RE: RegExp;
    MILDOM_RE: RegExp;
    BILIBILI_RE: RegExp;

    constructor(props) {
        super(props);
        this.YOUTUBE_RE =
            /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/im;
        this.TWITCH_RE = /(?:(?:http?s):\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9\-]+)/im;
        this.TWITCASTING_RE = /(?:(?:http?s):\/\/)?(?:www\.)?twitcasting\.tv\/([a-zA-Z0-9\-]+)/im;
        this.MILDOM_RE = /(?:(?:http?s):\/\/)?(?:www\.)?mildom\.com\/([0-9]+)/im;
        this.BILIBILI_RE = /(?:(?:http?s):\/\/)?(?:live\.)?bilibili\.com\/([0-9\-]+)/im;

        this.showError = this.showError.bind(this);
        this.submitNewJobs = this.submitNewJobs.bind(this);
        this.determineChannelPreview = this.determineChannelPreview.bind(this);
        this.callbacksOne = this.callbacksOne.bind(this);
        this.callbacksTwo = this.callbacksTwo.bind(this);
        this.showToast = this.showToast.bind(this);
        this.state = {
            isSubmitting: false,
            isValid: false,
            newUrl: "",
            password: "",

            videoId: "unknown",
            videoUrl: "#",
            videoPlatform: "unknown",
        };
    }

    callbacksOne(value: string) {
        let isValid = false;
        if (value.length > 0 && this.state.password.length > 0) {
            isValid = true;
        }
        this.setState({ newUrl: value, isValid });
    }

    callbacksTwo(value: string) {
        let isValid = false;
        if (value.length > 0 && this.state.newUrl.length > 0) {
            isValid = true;
        }
        this.setState({ password: value, isValid });
    }

    async submitNewJobs() {
        const { BACKEND_API } = this.props;
        const { newUrl, password } = this.state;
        if (this.state.isSubmitting) {
            return;
        }
        this.setState({ isSubmitting: true });

        const bodyFormData = new FormData();
        bodyFormData.append("url", newUrl);
        bodyFormData.append("passkey", password);

        try {
            const resp = await axios.post(`${BACKEND_API}/api/jobs`, bodyFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                responseType: "json",
            });
            const { status, data } = resp;
            if (status !== 200) {
                this.showError(
                    "An error occured, API response are: \n" + data.message + ` (Code: ${status})`
                );
            } else {
                this.showToast(`Stream ${newUrl} added!`, "info");
                this.setState({
                    isSubmitting: false,
                });
            }
        } catch (e) {
            let message = `An unknown error occured internally, ${e.toString()}`;
            if (e.response) {
                const { status, data } = e.response;
                if (status === 500) {
                    message = "Failed to contact the Backend API, please contact site admin";
                } else if (status === 502) {
                    message = "Connection to API can't be established (Possibly down)";
                } else if (status == 404 || status == 0) {
                    message = "Video cannot be found";
                }
                if (data && data.message) {
                    message = "An error occured, API response are: \n" + data.message + ` (Code: ${status})`;
                }
            }
            this.showError(message);
        }
    }

    showToast(toastText: string, mode: ToastType = "default") {
        if (this.toastCb) {
            this.toastCb.showToast(toastText, mode);
        }
    }

    showError(errorText: string) {
        if (this.errModalCb) {
            this.errModalCb.setError(errorText);
            this.errModalCb.showModal();
        }
        this.setState({ isSubmitting: false });
    }

    determineChannelPreview(urlInput: string) {
        const { YOUTUBE_RE, TWITCASTING_RE, TWITCH_RE, MILDOM_RE, BILIBILI_RE } = this;
        if (YOUTUBE_RE.test(urlInput)) {
            const channelId = extractChannelID(urlInput, YOUTUBE_RE);
            this.setState({ videoId: channelId, videoUrl: urlInput, videoPlatform: "youtube" });
        } else if (TWITCASTING_RE.test(urlInput)) {
            const channelId = extractChannelID(urlInput, TWITCASTING_RE);
            this.setState({ videoId: channelId, videoUrl: urlInput, videoPlatform: "twitcasting" });
        } else if (TWITCH_RE.test(urlInput)) {
            const channelId = extractChannelID(urlInput, TWITCH_RE);
            this.setState({ videoId: channelId, videoUrl: urlInput, videoPlatform: "twitch" });
        } else if (MILDOM_RE.test(urlInput)) {
            const channelId = extractChannelID(urlInput, MILDOM_RE);
            this.setState({ videoId: channelId, videoUrl: urlInput, videoPlatform: "mildom" });
        } else if (BILIBILI_RE.test(urlInput)) {
            const channelId = extractChannelID(urlInput, BILIBILI_RE);
            this.setState({ videoId: channelId, videoUrl: urlInput, videoPlatform: "bilibili" });
        } else {
            this.setState({ videoId: "unknown", videoUrl: "#", videoPlatform: "unknown" });
        }
    }

    render() {
        const { isSubmitting, isValid } = this.state;
        let disableButton = false;
        if (isSubmitting) {
            disableButton = true;
        }
        if (!isValid) {
            disableButton = true;
        }

        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>New - Jobs :: VTHell WebUI</title>
                    <MetadataHead.SEO
                        title="New Jobs"
                        description="Create a new jobs to be recorded later"
                        urlPath="/new"
                    />
                    <MetadataHead.Prefetch BACKEND_API={this.props.BACKEND_API} />
                </Head>
                <Navbar mode="create" />
                <ToastNotification onMounted={(cb) => (this.toastCb = cb)} />
                <main className="antialiased h-full pb-4">
                    <BaseContainer className="flex flex-col gap-4 mt-8 mb-6">
                        <span className="text-2xl font-bold mx-2">Add new jobs</span>
                        <hr className="opacity-60 mx-2" />
                    </BaseContainer>
                    <BaseContainer className="flex flex-col gap-4 mt-4 mb-6">
                        <label className="flex flex-col w-full mx-2">
                            <span className="uppercase tracking-wide font-semibold text-sm">Stream URL</span>
                            <input
                                type="text"
                                placeholder="https://youtube.com/watch?v=xxxxxxxxxxx"
                                className={`form-input bg-gray-700 mt-2 ${
                                    this.state.isSubmitting ? "opacity-80 cursor-not-allowed" : "opacity-100"
                                } transition`}
                                value={this.state.newUrl}
                                onChange={(ev) => this.callbacksOne(ev.target.value)}
                                disabled={this.state.isSubmitting}
                            />
                        </label>
                        <label className="flex flex-col w-full mx-2">
                            <span className="uppercase tracking-wide font-semibold text-sm">Password</span>
                            <input
                                type="password"
                                placeholder="**********************"
                                className={`form-input bg-gray-700 mt-2 ${
                                    this.state.isSubmitting ? "opacity-80 cursor-not-allowed" : "opacity-100"
                                } transition`}
                                value={this.state.password}
                                onChange={(ev) => this.callbacksTwo(ev.target.value)}
                                disabled={this.state.isSubmitting}
                            />
                        </label>
                        <div className="w-full mt-2 mx-2 flex flex-row gap-2">
                            <Buttons
                                onClick={() => this.determineChannelPreview(this.state.newUrl)}
                                className="w-full"
                            >
                                Validate
                            </Buttons>
                            <Buttons
                                btnType="success"
                                onClick={this.submitNewJobs}
                                className="w-full"
                                disabled={disableButton}
                            >
                                Submit
                            </Buttons>
                        </div>
                        <div className="w-full aspec-w-16 aspect-h-9 mx-2">
                            <EmbeddableVideo
                                id={this.state.videoId}
                                url={this.state.videoUrl}
                                platform={this.state.videoPlatform}
                                status="upcoming"
                                embedNow
                            />
                        </div>
                    </BaseContainer>
                    <Footer />
                </main>
                <ErrorModal onMounted={(cb) => (this.errModalCb = cb)} />
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
