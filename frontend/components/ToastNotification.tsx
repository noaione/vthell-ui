import React, { useEffect, useState } from "react";

import { motion, useAnimation } from "framer-motion";
import InfoIcon from "@heroicons/react/outline/InformationCircleIcon";

import { isType } from "../lib/utils";

function isValidNumber(data: any): data is number {
    if (!isType(data as number, "number")) {
        return false;
    }
    if (data < 0) {
        return false;
    }
    return true;
}

export type ToastType = "default" | "info";
export interface ToastCallbacks {
    showToast: (text: string, mode?: ToastType) => void;
}

interface ToastCollectionData {
    id: string;
    text: string;
    mode: ToastType;
}

interface ToastProps {
    duration?: number;
    onMounted: (callbacks: ToastCallbacks) => void;
}

interface ToastState {
    duration: number;
    toastCollection: ToastCollectionData[];
}

interface ToastData {
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
    }
    return null;
}

function NotificationBox(props: ToastData) {
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
    });

    // Chain of effects to close the toast
    // Chain 1: Check if class set to hidden again.
    //          If yes, set finished to true
    useEffect(() => {
        if (extraClass === "hidden" && isStarted) {
            setFinished(true);
        }
    }, [extraClass]);

    // Chain 2: Check if finished change to true from chain 1
    //          If yes, call the onFinished function.
    useEffect(() => {
        if (isFinished) {
            props.onFinished(id);
        }
    }, [isFinished]);

    const stylings = {
        default: "bg-gray-900 border-gray-700",
        info: "bg-blue-700 border-blue-500",
    };

    return (
        <motion.div
            id={id}
            className={`relative flex flex-row z-30 border bg-gray-900 border-gray-700 rounded-lg shadow-lg ${extraClass}`}
            initial="hide"
            variants={variants}
            animate={controls}
            transition={{ duration: 0.2 }}
        >
            {mode !== "default" && (
                <span className={`${stylings[mode]} w-[50px] h-[50px] rounded-l-lg -mr-2`}>
                    <SelectedIcon mode={mode} />
                </span>
            )}
            <span className={innerClassName}>{props.children}</span>
        </motion.div>
    );
}

export default class ToastNotification extends React.Component<ToastProps, ToastState> {
    toastId: number;

    constructor(props: ToastProps) {
        super(props);
        this.toastId = 1;
        const { duration } = this.props;
        this.showToast = this.showToast.bind(this);
        this.onToastFinished = this.onToastFinished.bind(this);

        this.state = {
            duration: isValidNumber(duration) ? duration : 3000,
            toastCollection: [],
        };
    }

    componentDidMount() {
        const self = this;
        this.props.onMounted({
            showToast: (text, mode) => self.showToast(text, mode),
        });
    }

    showToast(text: string, mode: ToastType = "default") {
        const { toastCollection } = this.state;
        toastCollection.push({ id: `toasty-${this.toastId}`, text, mode });
        this.toastId++;
        console.info("showToast:", toastCollection);
        this.setState({ toastCollection });
    }

    onToastFinished(id: string) {
        let { toastCollection } = this.state;
        toastCollection = toastCollection.filter((ev) => ev.id !== id);
        console.info("onToastFinished:", toastCollection);
        this.setState({ toastCollection });
    }

    render() {
        return (
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
        );
    }
}
