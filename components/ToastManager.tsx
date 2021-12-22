import React, { useEffect, useState } from "react";

import { motion, useAnimation } from "framer-motion";
import InfoIcon from "./Icons/InformationCircleIcon";
import ErrorIcon from "./Icons/ErrorIcon";

import { isNone, isType } from "../lib/utils";
import Portal from "./Portal";

function isValidNumber(data: any): data is number {
    if (!isType(data as number, "number")) {
        return false;
    }
    if (data < 0) {
        return false;
    }
    return true;
}

export type ToastType = "default" | "info" | "error";

type ToastModeCollection = {
    [key in ToastType]: string;
};

function fallback<T extends ToastModeCollection>(
    dataSet: T,
    key: keyof T,
    fallbackValue: T[keyof T]
): T[keyof T] {
    if (isNone(dataSet)) {
        return fallbackValue;
    }
    const data = dataSet[key];
    if (isNone(data)) {
        return fallbackValue;
    }
    return data;
}
export interface ToastCallbacks {
    showToast: (text: string, mode?: ToastType) => void;
}

export interface ToastData {
    text: string;
    mode: ToastType;
}

export interface ToastDataEvent extends Event {
    detail: ToastData;
}

interface ToastCollectionData extends ToastData {
    id: string;
}

interface ToastProps {
    duration?: number;
    onMounted?: (callbacks: ToastCallbacks) => void;
}

interface ToastState {
    duration: number;
    toastCollection: ToastCollectionData[];
}

interface ToastBoxData {
    toast: ToastCollectionData;
    innerClassName?: string;
    duration: number;
    onFinished: (id: string) => void;
    children?: React.ReactNode;
}

function SelectedIcon(props: Pick<ToastCollectionData, "mode">) {
    const { mode } = props;

    if (mode === "info") {
        return <InfoIcon className="w-6 h-6 mx-auto my-[0.8rem]" />;
    } else if (mode == "error") {
        return <ErrorIcon className="w-6 h-6 mx-auto my-[0.8rem]" />;
    }
    return null;
}

function NotificationBox(props: ToastBoxData) {
    const {
        toast: { id, mode },
        duration,
        innerClassName,
    } = props;
    const [extraClass, setExtraClass] = useState("hidden");
    const [isFinished, setFinished] = useState(false);
    const [isStarted, setStarted] = useState(false);
    const controls = useAnimation();

    const variants = {
        hide: {
            x: 50,
            opacity: 0,
        },
        show: {
            x: 0,
            opacity: 1,
        },
    };

    useEffect(() => {
        if (isFinished) {
            return;
        }
        controls.start("show");
        setStarted(true);
        setExtraClass("");
        setTimeout(() => {
            controls.start("hide");
            setTimeout(() => {
                setExtraClass("hidden");
                setFinished(true);
            }, 200);
        }, duration);
    }, [isFinished, duration, controls]);

    // Chain of effects to close the toast
    // Chain 1: Check if class set to hidden again.
    //          If yes, set finished to true
    useEffect(() => {
        if (extraClass === "hidden" && isStarted) {
            setFinished(true);
        }
    }, [extraClass, isStarted]);

    // Chain 2: Check if finished change to true from chain 1
    //          If yes, call the onFinished function.
    useEffect(() => {
        if (isFinished) {
            props.onFinished(id);
        }
    }, [isFinished, id, props]);

    const stylings = {
        default: "bg-gray-900 border-gray-700",
        info: "bg-blue-700 border-blue-500",
        error: "bg-red-700 border-red-500",
    };
    const styling = fallback(stylings, mode, stylings.default);

    return (
        <motion.div
            id={id}
            className={`relative flex flex-row z-30 border bg-gray-900 border-gray-700 rounded-lg shadow-lg ${extraClass}`}
            initial="hide"
            variants={variants}
            animate={controls}
            transition={{ duration: 0.2 }}
        >
            {styling !== stylings.default && (
                <span className={`${styling} w-[50px] h-[50px] rounded-l-lg -mr-2`}>
                    <SelectedIcon mode={mode} />
                </span>
            )}
            <span className={innerClassName}>{props.children}</span>
        </motion.div>
    );
}

export default class ToastManager extends React.Component<ToastProps, ToastState> {
    toastId: number;

    constructor(props: ToastProps) {
        super(props);
        this.toastId = 1;
        const { duration } = this.props;
        this.showToast = this.showToast.bind(this);
        this.onToastFinished = this.onToastFinished.bind(this);
        this.onToastNotification = this.onToastNotification.bind(this);

        this.state = {
            duration: isValidNumber(duration) ? duration : 3000,
            toastCollection: [],
        };
    }

    onToastNotification(event: Event) {
        const { detail } = event as ToastDataEvent;
        if (isNone(detail)) {
            return;
        }
        const { text, mode } = detail;
        if (!isNone(text) && text.trim().length > 0) {
            this.showToast(text, mode);
        }
    }

    componentDidMount() {
        if (typeof this.props.onMounted === "function") {
            this.props.onMounted({
                showToast: (text, mode) => this.showToast(text, mode),
            });
        }

        // Add custom event receiver
        document.addEventListener("toastNotification", this.onToastNotification);
    }

    componentWillUnmount() {
        document.removeEventListener("toastNotification", this.onToastNotification);
    }

    showToast(text: string, mode: ToastType = "default") {
        const { toastCollection } = this.state;
        toastCollection.push({ id: `toasty-${this.toastId}`, text, mode });
        this.toastId++;
        console.debug("showToast:", toastCollection);
        this.setState({ toastCollection });
    }

    onToastFinished(id: string) {
        let { toastCollection } = this.state;
        toastCollection = toastCollection.filter((ev) => ev.id !== id);
        console.debug("onToastFinished:", toastCollection);
        this.setState({ toastCollection });
    }

    render() {
        return (
            <Portal id="toast-notification">
                <div className="vthell-toast">
                    {this.state.toastCollection.map((toast) => {
                        return (
                            <NotificationBox
                                key={toast.id}
                                toast={toast}
                                duration={this.state.duration}
                                onFinished={this.onToastFinished}
                                innerClassName="px-5 py-3"
                            >
                                {toast.text}
                            </NotificationBox>
                        );
                    })}
                </div>
            </Portal>
        );
    }
}
