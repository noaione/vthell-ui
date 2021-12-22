import { RootState } from "@/lib/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import { AutoScheduler, AutoSchedulerType } from "@/lib/model";
import Buttons from "../Buttons";
import AutoSchedulerEditor from "./Editor";
import PostModal from "../Modal/PostModal";
import { CallbackModal } from "../Modal/Base";

const mapStateToProps = (state: RootState) => {
    return {
        schedulers: state.scheduler.scheduler,
    };
};

const mapDispatch = {
    resetState: () => ({ type: "scheduler/resetState" }),
    addScheduler: (payload: AutoScheduler) => ({ type: "scheduler/addScheduler", payload }),
};

const connector = connect(mapStateToProps, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface AddState {
    isEditing: boolean;
    isSubmit: boolean;
    scheduler: AutoScheduler | null;
}

class AutoSchedulerAdd extends React.Component<PropsFromRedux, AddState> {
    modalCb?: CallbackModal;

    constructor(props) {
        super(props);
        this.onSubmitted = this.onSubmitted.bind(this);
        this.onSuccess = this.onSuccess.bind(this);
        this.state = {
            isEditing: false,
            isSubmit: false,
            scheduler: null,
        };
    }

    toast(text: string, mode: string = "default") {
        document.dispatchEvent(new CustomEvent("toastNotification", { detail: { text, mode } }));
    }

    onSubmitted(payload: AutoScheduler, isCancelled?: boolean) {
        if (isCancelled) {
            this.setState({ isEditing: false });
            return;
        }
        this.setState({ scheduler: payload, isSubmit: true });
        if (this.modalCb) {
            this.modalCb.showModal();
        }
    }

    onSuccess(payload: any) {
        this.props.addScheduler(payload);
        this.toast("New scheduler has been added.", "info");
        this.setState({ isEditing: false, isSubmit: false });
    }

    render() {
        const { isEditing } = this.state;
        const BaseClass: AutoScheduler = this.state.scheduler ?? {
            data: "",
            type: "" as AutoSchedulerType,
            enabled: false,
            chains: null,
        };
        return (
            <>
                <div className="flex flex-col gap-2">
                    {isEditing ? (
                        <div className="flex flex-col w-full bg-gray-700 rounded-md p-3">
                            <AutoSchedulerEditor
                                scheduler={BaseClass}
                                onDoneChange={this.onSubmitted}
                                disabled={this.state.isSubmit}
                            />
                        </div>
                    ) : (
                        <Buttons onClick={() => this.setState({ isEditing: true })}>Add New</Buttons>
                    )}
                </div>
                <PostModal
                    payload={this.state.scheduler}
                    onSuccess={this.onSuccess}
                    path="auto-scheduler"
                    onMounted={(cb) => (this.modalCb = cb)}
                />
            </>
        );
    }
}

export default connector(AutoSchedulerAdd);
