import { AutoScheduler, AutoSchedulerBase, AutoSchedulerType } from "@/lib/model";
import { DateTime } from "luxon";
import React from "react";
import Buttons from "../Buttons";

interface ExtraProps {
    scheduler: AutoScheduler;
    disabled?: boolean;
    onDoneChange: (payload: AutoScheduler, isCancel?: boolean) => void;
}

interface DataState {
    data: string;
    type: string;
    enabled: boolean;
    chains: AutoSchedulerBase[];
    isSubmitting: boolean;
}

interface SelectorProps {
    onChange: (value: string) => void;
    current: string;
    disabled?: boolean;
}

interface SelectorState {
    current: string;
}

class TypeSelector extends React.Component<SelectorProps, SelectorState> {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.state = {
            current: this.props.current,
        };
    }

    onChange(value: string) {
        this.setState({ current: value });
        if (value.trim().length < 1) {
            return;
        }
        this.props.onChange(value);
    }

    render() {
        return (
            <select
                className="form-select bg-gray-800/40 block w-full mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200 rounded-md"
                onChange={(e) => this.onChange(e.target.value)}
                value={this.state.current}
                disabled={this.props.disabled}
            >
                <option value="" className="bg-gray-700">
                    Select a type
                </option>
                <option value="word" className="bg-gray-700">
                    Title Word Match
                </option>
                <option value="regex" className="bg-gray-700">
                    Title Regex Match
                </option>
                <option value="channel" className="bg-gray-700">
                    Channel ID Match
                </option>
                <option value="group" className="bg-gray-700">
                    Group/Organization Match
                </option>
            </select>
        );
    }
}

interface SchedulerChainProps extends AutoSchedulerBase {
    onChange: (index: number, data: AutoSchedulerBase) => void;
    index: number;
    disabled?: boolean;
}

class AutoSchedulerChainEditor extends React.Component<SchedulerChainProps, AutoSchedulerBase> {
    debouncerTimer?: NodeJS.Timeout;

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onTypeChange = this.onTypeChange.bind(this);
        this.state = {
            data: props.data,
            type: props.type,
        };
    }

    onChange(value: string) {
        this.setState({ data: value });
        if (this.debouncerTimer) {
            clearTimeout(this.debouncerTimer);
        }
        // simple debouncing
        this.debouncerTimer = setTimeout(() => {
            this.props.onChange(this.props.index, { ...this.state, data: value });
            if (this.debouncerTimer) {
                clearTimeout(this.debouncerTimer);
            }
        }, 500);
    }

    componentWillUnmount() {
        if (this.debouncerTimer) {
            clearTimeout(this.debouncerTimer);
        }
    }

    onTypeChange(value: string) {
        this.setState({ type: value as AutoSchedulerType });
        this.props.onChange(this.props.index, { ...this.state, type: value as AutoSchedulerType });
    }

    render(): React.ReactNode {
        const { disabled } = this.props;
        return (
            <>
                <div className="flex flex-col justify-center w-full mt-2">
                    <span className="text-gray-100 text-sm tracking-wide uppercase text-left">Data</span>
                    <input
                        className="form-input bg-gray-800/40 block w-full mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200 rounded-md"
                        value={this.state.data}
                        onChange={(ev) => this.onChange(ev.target.value)}
                        disabled={disabled}
                    />
                </div>
                <div className="flex flex-col justify-center w-full mt-2">
                    <span className="text-gray-100 text-sm tracking-wide uppercase text-left">Type</span>
                    <TypeSelector
                        onChange={(value) => this.onTypeChange(value)}
                        current={this.state.type}
                        disabled={disabled}
                    />
                </div>
            </>
        );
    }
}

class AutoSchedulerEditor extends React.Component<ExtraProps, DataState> {
    constructor(props) {
        super(props);
        this.onChainChange = this.onChainChange.bind(this);
        this.deleteChain = this.deleteChain.bind(this);
        this.addEmptyChain = this.addEmptyChain.bind(this);
        this.onDoneChange = this.onDoneChange.bind(this);

        this.state = {
            data: this.props.scheduler.data,
            type: this.props.scheduler.type,
            enabled: this.props.scheduler.enabled,
            chains: this.props.scheduler.chains || [],
            isSubmitting: false,
        };
    }

    onChainChange(index: number, data: AutoSchedulerBase) {
        const chains = [...this.state.chains];
        if (index > chains.length) {
            chains.push(data);
        } else {
            chains[index] = data;
        }
        this.setState({ chains });
    }

    deleteChain(index: number) {
        const { chains } = this.state;
        if (index > chains.length) {
            return;
        }
        const rebuildChain: AutoSchedulerBase[] = [];
        for (let i = 0; i < chains.length; i++) {
            if (i !== index) {
                rebuildChain.push(chains[i]);
            }
        }
        this.setState({ chains: rebuildChain });
    }

    addEmptyChain() {
        const chains = [...this.state.chains];
        chains.push({
            data: "",
            type: "" as AutoSchedulerType,
        });
        this.setState({ chains });
    }

    validateChanges(payload: AutoScheduler) {
        if (payload.data.trim().length < 1) {
            return "Data is required";
        }
        if (payload.type.trim().length < 1) {
            return "Unknown type received";
        }
        if (payload.chains !== null) {
            for (let x = 0; x < payload.chains.length; x++) {
                const chain = payload.chains[x];
                if (chain.data.trim().length < 1) {
                    return `Chain #${x + 1} data is required`;
                }
                if (chain.type.trim().length < 1) {
                    return `Chain #${x + 1} type is required`;
                }
            }
        }
        return null;
    }

    onDoneChange(original = false) {
        if (original) {
            this.props.onDoneChange(this.props.scheduler, true);
            return;
        }
        const newBase: AutoScheduler = {
            id: this.props.scheduler.id,
            data: this.state.data,
            type: this.state.type as AutoSchedulerType,
            enabled: this.state.enabled,
            chains: null,
        };
        if (this.state.chains.length > 0) {
            newBase.chains = this.state.chains;
        }
        const error = this.validateChanges(newBase);
        if (error) {
            const event = new CustomEvent("toastNotification", {
                detail: {
                    text: error,
                    mode: "error",
                },
            });
            document.dispatchEvent(event);
            return;
        }
        if (!["word", "regex"].includes(newBase.type)) {
            newBase.chains = null;
        }
        console.info("Scheduler data:", newBase);
        this.props.onDoneChange(newBase, false);
    }

    render(): React.ReactNode {
        const { scheduler, disabled } = this.props;
        const { chains, type } = this.state;
        const currentTime = DateTime.utc().toSeconds();

        return (
            <div className="flex flex-col">
                {scheduler.id && (
                    <div className="flex flex-col gap-2">
                        <label>
                            <span className="text-gray-100 mr-1">ID:</span>
                            <span className="text-gray-300">#{scheduler.id}</span>
                        </label>
                    </div>
                )}
                <div className="flex flex-col justify-center w-full mt-2">
                    <span className="text-gray-100 text-sm tracking-wide uppercase text-left">Data</span>
                    <input
                        className="form-input bg-gray-800/40 block w-full mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200 rounded-md"
                        value={this.state.data}
                        onChange={(ev) => this.setState({ data: ev.target.value })}
                        disabled={disabled}
                    />
                </div>
                <div className="flex flex-col justify-center w-full mt-2">
                    <span className="text-gray-100 text-sm tracking-wide uppercase text-left">Type</span>
                    <TypeSelector
                        onChange={(value) => this.setState({ type: value })}
                        current={this.state.type}
                        disabled={disabled}
                    />
                </div>
                <div className="flex flex-row mt-3 items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox rounded bg-gray-800 hover:border-blue-400 transition focus:outline-none"
                        checked={this.state.enabled}
                        disabled={disabled}
                        onChange={(ev) => this.setState({ enabled: ev.target.checked })}
                    />
                    <span className="ml-[0.45rem]">Enable</span>
                </div>
                {chains.length > 0 && ["word", "regex"].includes(type) && (
                    <>
                        <hr className="border-gray-500 my-4" />
                        <div className="flex flex-col gap-2">
                            {chains.map((chain, idx) => {
                                return (
                                    <div
                                        className="flex flex-col"
                                        key={`scheduler-${scheduler.id}-chain-${idx}-${currentTime}`}
                                    >
                                        <div className="flex flex-row items-center">
                                            <span className="text-gray-100 mr-1">Chain:</span>
                                            <span className="text-gray-300">#{idx + 1}</span>
                                            <Buttons
                                                className="px-2 py-1 ml-2"
                                                btnType="danger"
                                                onClick={() => this.deleteChain(idx)}
                                                disabled={disabled}
                                            >
                                                Delete
                                            </Buttons>
                                        </div>
                                        <AutoSchedulerChainEditor
                                            data={chain.data}
                                            type={chain.type}
                                            index={idx}
                                            onChange={this.onChainChange}
                                            disabled={disabled}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
                {["word", "regex"].includes(type) && (
                    <Buttons
                        className="mt-2"
                        btnType="success"
                        onClick={() => this.addEmptyChain()}
                        disabled={disabled}
                    >
                        Add Chain
                    </Buttons>
                )}
                <div className="flex flex-row w-full gap-2 mt-2">
                    <Buttons
                        btnType="primary"
                        className="w-full"
                        onClick={() => this.onDoneChange()}
                        disabled={disabled}
                    >
                        Submit
                    </Buttons>
                    <Buttons
                        btnType="danger"
                        className="w-full"
                        onClick={() => this.onDoneChange(true)}
                        disabled={disabled}
                    >
                        Cancel
                    </Buttons>
                </div>
            </div>
        );
    }
}

export default AutoSchedulerEditor;
