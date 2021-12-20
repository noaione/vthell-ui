import React from "react";

import { VTHellJob, VTHellJobStatus } from "@/lib/model";
import BaseContainer from "./BaseContainer";
import YoutubeEmbed from "./YoutubeEmbed";
import Buttons from "./Buttons";
import DeleteModal from "./Modal/DeleteModal";
import { CallbackModal } from "./Modal/Base";
import DynamicDateTime from "./DynamicDateTime";

export function mapStatusFormat(status: VTHellJobStatus) {
    switch (status) {
        case "DONE":
            return "Finished recording";
        case "CLEANING":
            return "Cleaning up";
        case "WAITING":
            return "Waiting for stream";
        case "DOWNLOADING":
            return "Recording stream";
        case "PREPARING":
            return "Waiting for stream";
        case "MUXING":
            return "Merging video and audio";
        case "UPLOAD":
            return "Uploading the recording";
        case "ERROR":
            return "An error occured";
        default:
            return "Unknown";
    }
}

interface JobProps {
    job: VTHellJob;
}

export default class JobCard extends React.Component<JobProps> {
    modalCb?: CallbackModal;

    constructor(props: JobProps) {
        super(props);
        this.showModal = this.showModal.bind(this);
    }

    showModal() {
        if (this.modalCb) {
            this.modalCb.showModal();
        }
    }

    render(): React.ReactNode {
        const { job } = this.props;

        return (
            <div id={`job-${job.id}`} className="flex mx-2">
                <BaseContainer className="bg-gray-900">
                    <div className="relative">
                        <YoutubeEmbed id={job.id} imageClassName="rounded-t-lg aspect-video" />
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-700">
                        <p className="mt-1 uppercase tracking-wide font-bold">
                            {job.is_member ? "🔐" : ""}
                            {job.channel_id} • <span className="normal-case">{job.id}</span>
                            {job.is_member ? " • Members-Only" : ""}
                        </p>
                        <p className="mt-2 text-white text-lg font-semibold">{job.title}</p>
                        <p className="mt-2 ml-1">
                            <DynamicDateTime unix={job.start_time} />
                        </p>
                    </div>
                    <div className="px-4 py-4 text-gray-200 bg-gray-800">
                        <p className="ml-1 text-lg">
                            <span className="font-bold">Status:</span> {mapStatusFormat(job.status)}
                        </p>
                    </div>
                    <div className="text-center py-4 bg-gray-700">
                        <Buttons use="a" href={"https://youtube.com/watch?v=" + job.id} className="mx-1">
                            Watch
                        </Buttons>
                        <Buttons btnType="danger" className="mx-1" onClick={() => this.showModal()}>
                            Delete
                        </Buttons>
                    </div>
                </BaseContainer>
                <DeleteModal passId={job.id} path="schedule" onMounted={(cb) => (this.modalCb = cb)} />
            </div>
        );
    }
}
