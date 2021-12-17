import React from "react";
import Buttons from "../Buttons";

import Modal, { CallbackModal, ModalProps } from "./Base";

interface ModalProperties extends ModalProps {
    videoId?: string;
}

interface DeleteModalState {
    passbox: string;
}

export default class DeleteModal extends React.Component<ModalProperties, DeleteModalState> {
    modalCb?: CallbackModal;

    constructor(props: ModalProps) {
        super(props);
        this.handleHide = this.handleHide.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.apiDeleteRequest = this.apiDeleteRequest.bind(this);
        this.state = {
            passbox: "",
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
        this.setState({ passbox: "" });
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

    async apiDeleteRequest() {
        const { videoId } = this.props;
        console.info(`Deleting request of ${videoId}`);
        setTimeout(() => {
            this.handleHide();
        }, 1000);
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
                    <Buttons onClick={this.apiDeleteRequest} btnType="danger" disabled={passbox.length < 1}>
                        Delete
                    </Buttons>
                </Modal.Footer>
            </Modal>
        );
    }
}
