import React, { useEffect, useState } from "react";

import ChevronUpIcon from "@heroicons/react/outline/ChevronUpIcon";

interface SimpleProps {
    startAt?: number;
}

export default function BackToTop(props: SimpleProps) {
    let { startAt } = props;
    startAt = startAt || 150;
    startAt = isNaN(parseInt((startAt as unknown) as string)) ? 150 : startAt;

    const [btnVisible, setBtnVisible] = useState(false);
    const [stateClass, setStateClass] = useState("hidden");

    function showButton() {
        if (window.pageYOffset > startAt) {
            setBtnVisible(true);
        } else {
            setBtnVisible(false);
        }
    }

    useEffect(() => {
        window.addEventListener("scroll", showButton);
        return () => {
            window.removeEventListener("scroll", showButton);
        };
    });

    useEffect(() => {
        if (btnVisible) {
            setStateClass("");
        } else {
            setTimeout(() => {
                setStateClass("hidden");
            }, 150);
        }
    }, [btnVisible]);

    const extraClass = btnVisible ? "opacity-100" : "opacity-0";
    return (
        <div className="flex items-end justify-end fixed bottom-0 right-0 mb-6 mr-6 z-20">
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`block w-16 h-16 justify-center text-xl rounded-full transition-all shadow hover:shadow-lg transform hover:scale-110 bg-gray-700 text-gray-300 focus:outline-none ${extraClass} ${stateClass}`}
            >
                <ChevronUpIcon className="w-10 h-10 mx-auto" />
            </button>
        </div>
    );
}
