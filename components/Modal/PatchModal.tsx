import { buildPath, isNone } from "@/lib/utils";
import React from "react";
import Buttons from "../Buttons";

import Modal, { CallbackModal, ModalProps } from "./Base";

interface ModalProperties extends ModalProps {
    id: string;
    payload: any;
    path: string;
    onSuccess?: (payload: any) => void;
    onFailure?: () => void;
    onCancel?: () => void;
}

interface PatchModalState {
    passbox: string;
    isSubmit: boolean;
}

export default class PatchModal extends React.Component<ModalProperties, PatchModalState> {
    modalCb?: CallbackModal;

    constructor(props: ModalProperties) {
        super(props);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.callOnSuccess = this.callOnSuccess.bind(this);
        this.callOnFailure = this.callOnFailure.bind(this);
        this.apiPatchRequest = this.apiPatchRequest.bind(this);
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

    handleHide(callCancel: boolean = false) {
        this.setState({ passbox: "", isSubmit: false });
        if (this.modalCb) {
            this.modalCb.hideModal();
        }
        if (callCancel && typeof this.props.onCancel === "function") {
            this.props.onCancel();
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

    callOnSuccess(payload: any) {
        if (typeof this.props.onSuccess === "function") {
            this.props.onSuccess(payload);
        }
    }

    callOnFailure() {
        if (typeof this.props.onFailure === "function") {
            this.props.onFailure();
        }
    }

    async apiPatchRequest() {
        const { path, payload } = this.props;
        const { passbox } = this.state;
        const { NEXT_PUBLIC_HTTP_URL } = process.env;
        if (isNone(NEXT_PUBLIC_HTTP_URL)) {
            this.toast("Cannot find the public HTTP url to submit deletion! Contact admin!", "error");
            this.handleHide();
            return;
        }
        console.info(`PATCHing request of ${payload} to /api/${path}/${this.props.id}`);
        this.setState({ isSubmit: true });

        const url = buildPath(NEXT_PUBLIC_HTTP_URL, ["api", path, this.props.id]);

        const resp = await fetch(url, {
            method: "PATCH",
            body: JSON.stringify(payload),
            headers: {
                Authorization: `Password ${passbox}`,
                "Content-Type": "application/json",
            },
        });
        switch (resp.status) {
            case 200:
                this.handleHide();
                this.callOnSuccess(await resp.json());
                break;
            case 204:
                this.handleHide();
                this.callOnSuccess(payload);
                break;
            case 400:
                this.toast((await resp.json()).error, "error");
                this.handleHide();
                this.callOnFailure();
                break;
            case 401:
                this.toast("Wrong password!", "error");
                this.handleHide();
                this.callOnFailure();
                break;
            case 403:
                this.toast("You are not authorized to modify it!", "error");
                this.handleHide();
                this.callOnFailure();
                break;
            case 500:
                this.toast("Internal server error!", "error");
                console.error(resp);
                this.handleHide();
                this.callOnFailure();
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
                    this.setState({ isSubmit: false, passbox: "" });
                    if (typeof this.props.onCancel === "function") {
                        this.props.onCancel();
                    }
                    if (typeof onClose === "function") {
                        onClose();
                    }
                }}
            >
                <Modal.Head>Enter Password</Modal.Head>
                <Modal.Body>
                    <span>This will modify the target you want to VTHell</span>
                    <div className="mt-2">
                        <label className="inline-flex flex-col justify-center w-full">
                            <span className="text-gray-100 text-sm tracking-wide uppercase text-left">
                                Password
                            </span>
                            <input
                                className="form-input bg-gray-800 block w-full mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200"
                                type="password"
                                value={this.state.passbox}
                                onChange={(ev) => this.setState({ passbox: ev.target.value })}
                                placeholder="**************"
                            />
                        </label>
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-center gap-2">
                    <Buttons
                        onClick={this.apiPatchRequest}
                        btnType="success"
                        disabled={passbox.length < 1 || this.state.isSubmit}
                    >
                        Modify
                    </Buttons>
                    <Buttons btnType="danger" onClick={() => this.handleHide(true)}>
                        Cancel
                    </Buttons>
                </Modal.Footer>
            </Modal>
        );
    }
}
