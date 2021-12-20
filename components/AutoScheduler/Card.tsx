import { connect, ConnectedProps } from "react-redux";
import React from "react";
import { AutoScheduler } from "@/lib/model";
import Buttons from "../Buttons";
import DeleteModal from "../Modal/DeleteModal";
import { CallbackModal } from "../Modal/Base";

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
}

class AutoSchedulerCard extends React.Component<PropsFromRedux & ExtraProps, State> {
    deleteModal?: CallbackModal;

    constructor(props) {
        super(props);
        this.shoeDeleteModal = this.shoeDeleteModal.bind(this);
        this.onDeleted = this.onDeleted.bind(this);

        this.state = {
            isEditing: false,
        };
    }

    shoeDeleteModal() {
        if (this.deleteModal) {
            this.deleteModal.showModal();
        }
    }

    onDeleted() {
        const event = new CustomEvent("toastNotification", {
            detail: { text: `Scheduler #${this.props.scheduler.id} has been deleted.`, mode: "info" },
        });
        document.dispatchEvent(event);
        this.props.removeScheduler(this.props.scheduler.id);
    }

    render() {
        const { scheduler, isAdmin } = this.props;
        // const { isEditing } = this.state;

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
                            <Buttons btnType="danger" onClick={() => this.shoeDeleteModal()}>
                                Delete
                            </Buttons>
                        </div>
                    )}
                </div>
                <DeleteModal
                    passId={scheduler.id.toString()}
                    path="auto-scheduler"
                    onMounted={(cb) => (this.deleteModal = cb)}
                    onDeleteSuccess={() => this.onDeleted()}
                />
            </>
        );
    }
}

export default connector(AutoSchedulerCard);
