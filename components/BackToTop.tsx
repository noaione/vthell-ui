import React, { useEffect, useState } from "react";

interface BackToProps {
    startAt?: number;
}

export default function BackTopTop(props: BackToProps) {
    const { startAt } = props;
    let startAtMagic = startAt || 150;
    startAtMagic = isNaN(parseInt(startAt as unknown as string)) ? 150 : startAtMagic;

    const [btnVisible, setBtnVisible] = useState(false);
    const [stateClass, setStateClass] = useState("hidden");

    function showButton() {
        if (window.scrollY > startAtMagic) {
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
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>
        </div>
    );
}
