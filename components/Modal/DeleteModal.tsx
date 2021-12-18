import { buildPath, isNone } from "@/lib/utils";
import React from "react";
import Buttons from "../Buttons";

import Modal, { CallbackModal, ModalProps } from "./Base";

interface ModalProperties extends ModalProps {
    videoId: string;
}

interface DeleteModalState {
    passbox: string;
    isSubmit: boolean;
}

export default class DeleteModal extends React.Component<ModalProperties, DeleteModalState> {
    modalCb?: CallbackModal;

    constructor(props: ModalProperties) {
        super(props);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.apiDeleteRequest = this.apiDeleteRequest.bind(this);
        this.state = {
            passbox: "",
            isSubmit: false,
        };
    }

    componentDidMount() {
        if (typeof this.props.onMounted === "function") {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const outerThis = this;
            this.props.onMounted({
                showModal: () => outerThis.handleShow(),
                hideModal: () => outerThis.handleHide(),
            });
        }
    }

    handleHide() {
        this.setState({ passbox: "", isSubmit: false });
        if (this.modalCb) {
            this.modalCb.hideModal();
        }
    }

    handleShow() {
        if (this.modalCb) {
            this.modalCb.showModal();
        }
    }

    toggleModal() {
        if (this.modalCb && this.modalCb.toggleModal) {
            this.modalCb.toggleModal();
        }
    }

    toast(text: string, mode: string = "default") {
        document.dispatchEvent(new CustomEvent("toastNotification", { detail: { text, mode } }));
    }

    async apiDeleteRequest() {
        const { videoId } = this.props;
        const { passbox } = this.state;
        const { NEXT_PUBLIC_HTTP_URL } = process.env;
        if (isNone(NEXT_PUBLIC_HTTP_URL)) {
            this.toast("Cannot find the public HTTP url to submit deletion! Contact admin!", "error");
            this.handleHide();
            return;
        }
        console.info(`Deleting request of ${videoId}`);
        this.setState({ isSubmit: true });

        const url = buildPath(NEXT_PUBLIC_HTTP_URL, ["api", "schedule", videoId]);

        const resp = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Password ${passbox}`,
            },
        });
        switch (resp.status) {
            case 200:
                this.handleHide();
                break;
            case 401:
                this.toast("Wrong password!", "error");
                this.handleHide();
                break;
            case 403:
                this.toast("You are not authorized to delete this video!", "error");
                this.handleHide();
                break;
            case 404:
                this.toast("Video not found on VTHell!", "error");
                this.handleHide();
                break;
            case 406:
                this.toast("Video status does not allow for deletion!", "error");
                this.handleHide();
                break;
            case 500:
                this.toast("Internal server error!", "error");
                console.error(resp);
                this.handleHide();
                break;
        }
    }

    render() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { onMounted, onClose, ...props } = this.props;
        let { passbox } = this.state;
        passbox = passbox.trim();
        return (
            <Modal
                {...props}
                onMounted={(callback) => (this.modalCb = callback)}
                onClose={() => {
                    // Forward the onClose
                    if (typeof onClose === "function") {
                        onClose();
                    }
                }}
            >
                <Modal.Head>⚠ Are you sure?</Modal.Head>
                <Modal.Body>
                    <span>This will permanently delete the job</span>
                    <div className="mt-2">
                        <label className="inline-flex flex-col justify-center w-full">
                            <span className="text-gray-100 text-sm tracking-wide uppercase text-left">
                                Password
                            </span>
                            <input
                                className="form-input bg-gray-600 block w-full mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200"
                                type="password"
                                value={this.state.passbox}
                                onChange={(ev) => this.setState({ passbox: ev.target.value })}
                                placeholder="**************"
                            />
                        </label>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-center gap-2">
                    <Buttons onClick={() => this.handleHide()}>Cancel</Buttons>
                    <Buttons
                        onClick={this.apiDeleteRequest}
                        btnType="danger"
                        disabled={passbox.length < 1 || this.state.isSubmit}
                    >
                        Delete
                    </Buttons>
                </Modal.Footer>
            </Modal>
        );
    }
}
