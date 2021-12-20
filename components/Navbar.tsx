import React from "react";
import Router from "next/router";
import { isNone } from "@/lib/utils";
import LoginIcon from "./Icons/LoginIcon";

interface NavbarProps {
    mode?: "home" | "records" | "create" | "scheduler" | "error" | "login";
    noSticky?: boolean;
}

interface NavbarState {
    active: boolean;
}

class Navbar extends React.Component<NavbarProps, NavbarState> {
    constructor(props) {
        super(props);
        this.toggleDropdown = this.toggleDropdown.bind(this);

        this.state = {
            active: false,
        };
    }

    toggleDropdown() {
        this.setState((prevState) => ({ active: !prevState.active }));
    }

    async navigateLink(urlTarget: string) {
        Router.push(urlTarget);
    }

    render() {
        const { mode, noSticky } = this.props;

        let jobsUrl = "#";
        let recordedUrl = "#";
        let createUrl = "#";
        let schedulerUrl = "#";
        let loginUrl = "#";

        let stickyModel = "sticky top-0 z-10";
        if (noSticky) {
            stickyModel = "";
        }

        if (mode === "records") {
            jobsUrl = "/";
            createUrl = "/new";
            schedulerUrl = "/scheduler";
            loginUrl = "/login";
        } else if (mode === "create") {
            jobsUrl = "/";
            recordedUrl = "/records";
            schedulerUrl = "/scheduler";
            loginUrl = "/login";
        } else if (mode === "error") {
            jobsUrl = "/";
            recordedUrl = "/records";
            createUrl = "/new";
            schedulerUrl = "/scheduler";
            loginUrl = "/login";
        } else if (mode === "scheduler") {
            jobsUrl = "/";
            recordedUrl = "/records";
            createUrl = "/new";
            loginUrl = "/login";
        } else if (mode === "login") {
            jobsUrl = "/";
            recordedUrl = "/records";
            createUrl = "/new";
            schedulerUrl = "/scheduler";
        } else {
            recordedUrl = "/records";
            createUrl = "/new";
            schedulerUrl = "/scheduler";
            loginUrl = "/login";
        }

        let extraClass = "hidden";
        if (this.state.active) {
            extraClass = "";
        }

        const { NEXT_PUBLIC_ARCHIVE_URL } = process.env;
        const downloadPage = !isNone(NEXT_PUBLIC_ARCHIVE_URL) ? new URL(NEXT_PUBLIC_ARCHIVE_URL) : null;

        return (
            <header className={"bg-gray-700/80 backdrop-blur-xl " + stickyModel}>
                <nav className="relative select-none lg:flex lg:items-stretch w-full py-3">
                    <div className="w-full relative flex justify-between lg:w-auto pr-4 lg:static lg:block lg:justify-start">
                        <a
                            className="group flex flex-row items-center ml-4"
                            onClick={(ev) => {
                                ev.preventDefault();
                                this.navigateLink(jobsUrl);
                            }}
                        >
                            <img src="https://p.n4o.xyz/i/cococlock.gif" alt="Coco Okite" className="h-12" />
                            <span className="font-semibold text-xl tracking-tight ml-2 text-white group-hover:opacity-80 transition">
                                VTHell
                            </span>
                        </a>
                        <button
                            onClick={this.toggleDropdown}
                            className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                            type="button"
                        >
                            <span className="block relative w-6 h-px rounded-sm bg-white"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                            <span className="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
                        </button>
                    </div>

                    <div
                        className={
                            extraClass +
                            " mt-4 lg:mt-0 lg:flex lg:items-stretch lg:flex-no-shrink lg:flex-grow"
                        }
                    >
                        <div className="lg:flex lg:items-stretch lg:justify-end ml-auto mr-4">
                            <a
                                href={createUrl}
                                className="px-2 lg:px-1 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 transition"
                            >
                                {/* <PlusIcon className="w-5 h-5" /> */}
                                <span className="block lg:hidden">Add new jobs</span>
                            </a>
                            <a
                                href={jobsUrl}
                                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 transition"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    this.navigateLink(jobsUrl);
                                }}
                            >
                                Jobs
                            </a>
                            <a
                                href={recordedUrl}
                                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 transition"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    this.navigateLink(recordedUrl);
                                }}
                            >
                                Records
                            </a>
                            <a
                                href={schedulerUrl}
                                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 transition"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    this.navigateLink(schedulerUrl);
                                }}
                            >
                                Scheduler
                            </a>
                            {downloadPage && (
                                <a
                                    href={downloadPage.href}
                                    className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 transition"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Archive
                                </a>
                            )}
                            <a
                                href={loginUrl}
                                className="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 transition"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    this.navigateLink(loginUrl);
                                }}
                            >
                                <LoginIcon className="w-5 h-5" />
                                <span className="block lg:hidden mx-1">Login</span>
                            </a>
                        </div>
                    </div>
                </nav>
            </header>
        );
    }
}

export default Navbar;
