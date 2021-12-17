import "preact/debug";
import React from "react";
import Router from "next/router";
import ProgressBar from "@badrap/bar-of-progress";
import type { AppProps } from "next/app";
import { AnimatePresence, AnimateSharedLayout } from "framer-motion";
import { Provider } from "react-redux";

import { store } from "@/lib/store";

import "../styles/global.css";

const progress = new ProgressBar({
    size: 2,
    color: "#fe9a62",
    className: "z-[99]",
    delay: 80,
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

function VTHellWebUIAppContext({ Component, pageProps, router }: AppProps) {
    return (
        <Provider store={store}>
            <AnimateSharedLayout>
                <AnimatePresence exitBeforeEnter key={router.route}>
                    <Component {...pageProps} />
                </AnimatePresence>
            </AnimateSharedLayout>
        </Provider>
    );
}

export default VTHellWebUIAppContext;
