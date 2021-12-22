import { connect, ConnectedProps } from "react-redux";
import React from "react";
import { AutoScheduler } from "@/lib/model";
import Buttons from "../Buttons";
import DeleteModal from "../Modal/DeleteModal";
import { CallbackModal } from "../Modal/Base";
import AutoSchedulerEditor from "./Editor";
import PatchModal from "../Modal/PatchModal";

const mapDispatch = {
    updateScheduler: (payload: AutoScheduler) => ({ type: "scheduler/updateScheduler", payload }),
    removeScheduler: (payload: number) => ({ type: "scheduler/removeScheduler", payload }),
};

const connector = connect(null, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface ExtraProps {
    scheduler: AutoScheduler;
    isAdmin: boolean;
}

interface State {
    isEditing: boolean;
    isSubmit: boolean;
    schedulerModify: AutoScheduler | null;
}

class AutoSchedulerCard extends React.Component<PropsFromRedux & ExtraProps, State> {
    deleteModal?: CallbackModal;
    patchModal?: CallbackModal;

    constructor(props) {
        super(props);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.onDeleted = this.onDeleted.bind(this);
        this.onEditorCallback = this.onEditorCallback.bind(this);
        this.onPatchSuccess = this.onPatchSuccess.bind(this);

        this.state = {
            isEditing: false,
            schedulerModify: null,
            isSubmit: false,
        };
    }

    showDeleteModal() {
        if (this.deleteModal) {
            this.deleteModal.showModal();
        }
    }

    toast(text: string, mode: string = "default") {
        const event = new CustomEvent("toastNotification", {
            detail: { text, mode },
        });
        document.dispatchEvent(event);
    }

    onDeleted() {
        this.toast(`Scheduler #${this.props.scheduler.id} has been deleted.`, "info");
        if (this.props.scheduler.id) {
            this.props.removeScheduler(this.props.scheduler.id);
        }
    }

    onEditorCallback(payload: any, isCancel?: boolean) {
        if (isCancel) {
            this.setState({ isEditing: false });
            return;
        }
        this.setState({ isSubmit: true, schedulerModify: payload }, () => {
            if (this.patchModal) {
                this.patchModal.showModal();
            }
        });
    }

    onPatchSuccess(payload: any) {
        this.props.updateScheduler(payload);
        this.toast(`Scheduler #${this.props.scheduler.id} has been updated.`, "info");
        this.setState({ isEditing: false, isSubmit: false });
    }

    render() {
        const { scheduler, isAdmin } = this.props;
        const { isEditing } = this.state;

        const scheduleId = (scheduler.id ?? 0).toString();

        if (isEditing) {
            return (
                <>
                    <div className="flex flex-col w-full bg-gray-700 rounded-md p-3">
                        <AutoSchedulerEditor
                            scheduler={scheduler}
                            onDoneChange={this.onEditorCallback}
                            disabled={this.state.isSubmit}
                        />
                    </div>
                    <PatchModal
                        id={scheduleId}
                        path="auto-scheduler"
                        onMounted={(cb) => (this.patchModal = cb)}
                        onSuccess={this.onPatchSuccess}
                        payload={this.state.schedulerModify}
                    />
                </>
            );
        }

        return (
            <>
                <div className="flex flex-row w-full justify-between bg-gray-700 rounded-md p-3">
                    <div className="flex flex-col">
                        <span className="tracking-wide">
                            {scheduler.id} - {scheduler.type.toUpperCase()}
                            {" - "}
                            {scheduler.enabled ? (
                                <span className="text-green-600">Enabled</span>
                            ) : (
                                <span className="text-red-600">Disabled</span>
                            )}
                        </span>
                        <span>{scheduler.data}</span>
                        {scheduler.chains !== null &&
                            scheduler.chains.map((chain, idx) => {
                                return (
                                    <React.Fragment key={`scheduler-${scheduler.id}-chain-${idx}`}>
                                        <span>
                                            <span className="font-semibold">Chain #{idx + 1}: </span>
                                            <span>
                                                {" "}
                                                <span className="text-gray-300">{chain.data}</span>{" "}
                                                <span className="tracking-wide uppercase">{`(${chain.type})`}</span>
                                            </span>
                                        </span>
                                    </React.Fragment>
                                );
                            })}
                    </div>
                    {isAdmin && (
                        <div className="flex flex-row gap-2 my-auto">
                            <Buttons btnType="warning" onClick={() => this.setState({ isEditing: true })}>
                                Edit
                            </Buttons>
                            <Buttons btnType="danger" onClick={() => this.showDeleteModal()}>
                                Delete
                            </Buttons>
                        </div>
                    )}
                </div>
                <DeleteModal
                    passId={scheduleId}
                    path="auto-scheduler"
                    onMounted={(cb) => (this.deleteModal = cb)}
                    onDeleteSuccess={() => this.onDeleted()}
                />
            </>
        );
    }
}

export default connector(AutoSchedulerCard);
