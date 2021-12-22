import BaseContainer from "@/components/BaseContainer";
import Buttons from "@/components/Buttons";
import MetadataHead from "@/components/MetadataHead";
import { CallbackModal } from "@/components/Modal/Base";
import PostModal from "@/components/Modal/PostModal";
import Navbar from "@/components/Navbar";
import ToastManager from "@/components/ToastManager";
import Head from "next/head";
import React from "react";

function extractVideoUrl(videoUrl: string, regex: RegExp) {
    while (true) {
        const res = regex.exec(videoUrl);
        if (res !== null) {
            return res[1];
        }
    }
}

interface State {
    videoUrl: string;
    videoId: string;
    thumbnailUrl: string;
    isSubmit: boolean;
}

export default class AddNewSchedulePages extends React.Component<{}, State> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.submitNewJobs = this.submitNewJobs.bind(this);
        this.matchVideoUrl = this.matchVideoUrl.bind(this);
        this.onSubmitSuccess = this.onSubmitSuccess.bind(this);
        this.testValidation = this.testValidation.bind(this);
        this.state = {
            videoUrl: "",
            videoId: "",
            thumbnailUrl: "",
            isSubmit: false,
        };
    }

    toast(text: string, mode: string = "default") {
        const event = new CustomEvent("toastNotification", {
            detail: { text, mode },
        });
        document.dispatchEvent(event);
    }

    matchVideoUrl() {
        const YOUTUBEREGEX =
            /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9_-]+)/im;
        if (YOUTUBEREGEX.test(this.state.videoUrl)) {
            const videoId = extractVideoUrl(this.state.videoUrl, YOUTUBEREGEX);
            return videoId;
        }
        return null;
    }

    submitNewJobs() {
        if (this.state.videoUrl.trim().length < 1) {
            this.toast("Please enter a valid URL", "error");
            return;
        }
        const videoId = this.matchVideoUrl();
        if (videoId === null) {
            this.toast("Invalid video URL!", "error");
            return;
        }
        this.setState({ isSubmit: true, videoId }, () => {
            if (this.modalCb) {
                this.modalCb.showModal();
            }
        });
    }

    onSubmitSuccess(payload: any) {
        this.setState({ isSubmit: false, videoId: "", videoUrl: "" });
        this.toast(`Successfully added job ${payload.id}`, "info");
    }

    testValidation() {
        if (this.state.videoUrl.trim().length < 1) {
            this.toast("Please enter a valid URL", "error");
            return;
        }
        const videoId = this.matchVideoUrl();
        if (videoId === null) {
            this.toast("Invalid video URL!", "error");
            return;
        }
        const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        this.setState({ videoId, thumbnailUrl });
    }

    render(): React.ReactNode {
        const { thumbnailUrl } = this.state;
        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>New Job :: VTHell WebUI</title>
                    <MetadataHead.SEO
                        title="New Job"
                        urlPath="/new"
                        description="Create new job for recording"
                    />
                    <MetadataHead.Prefetch />
                </Head>
                <Navbar mode="create" />
                <main className="antialiased h-full pb-4">
                    <BaseContainer className="flex flex-col gap-4 mt-8 mb-6">
                        <span className="text-2xl font-bold mx-2">Add new jobs</span>
                        <hr className="opacity-60 mx-2" />
                    </BaseContainer>
                    <BaseContainer className="flex flex-col gap-4 mt-4 mb-6">
                        <label className="flex flex-col w-full">
                            <span className="uppercase tracking-wide font-semibold text-sm mx-2">
                                Stream URL
                            </span>
                            <input
                                type="text"
                                placeholder="https://youtube.com/watch?v=xxxxxxxxxxx"
                                className={`form-input rounded-md bg-gray-800/30 mt-2 mx-2 ${
                                    this.state.isSubmit ? "opacity-80 cursor-not-allowed" : "opacity-100"
                                } transition`}
                                value={this.state.videoUrl}
                                onChange={(ev) => this.setState({ videoUrl: ev.target.value })}
                                disabled={this.state.isSubmit}
                            />
                        </label>
                        <div className="flex flex-row justify-between gap-2">
                            <Buttons
                                className="w-full"
                                onClick={this.testValidation}
                                disabled={this.state.isSubmit}
                            >
                                Validate
                            </Buttons>
                            <Buttons
                                btnType="success"
                                onClick={this.submitNewJobs}
                                className="w-full"
                                disabled={this.state.isSubmit}
                            >
                                Submit
                            </Buttons>
                        </div>
                        <div className="flex flex-col aspect-video bg-gray-700 rounded-md">
                            {thumbnailUrl ? (
                                <img
                                    className="object-cover object-center"
                                    src={thumbnailUrl}
                                    alt="Thumbnail"
                                />
                            ) : (
                                <div className="text-center mt-2">Waiting for validation...</div>
                            )}
                        </div>
                    </BaseContainer>
                </main>
                <PostModal
                    payload={{ id: this.state.videoId }}
                    onMounted={(cb) => (this.modalCb = cb)}
                    path="schedule"
                    onSuccess={this.onSubmitSuccess}
                    onFailure={() => this.setState({ isSubmit: false })}
                />
                <ToastManager />
            </>
        );
    }
}
