import { RootState } from "@/lib/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import { AutoScheduler } from "@/lib/model";
import AutoSchedulerCard from "./Card";

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

interface ExtraProps {
    isAdmin: boolean;
}

class AutoSchedulerManager extends React.Component<PropsFromRedux & ExtraProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { schedulers, isAdmin } = this.props;
        return (
            <div className="flex flex-col gap-2">
                {schedulers.map((scheduler) => {
                    return (
                        <AutoSchedulerCard
                            key={`scheduler-${scheduler.id}-${scheduler.enabled}`}
                            scheduler={scheduler}
                            isAdmin={isAdmin}
                        />
                    );
                })}
            </div>
        );
    }
}

export default connector(AutoSchedulerManager);
