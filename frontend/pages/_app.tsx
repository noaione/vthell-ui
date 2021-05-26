import React from "react";
import { AnimatePresence, AnimateSharedLayout } from "framer-motion";

import "../styles/global.css";
import type { AppProps } from "next/app";

function VTHellWebUIAppContext({ Component, pageProps, router }: AppProps) {
    return (
        <AnimateSharedLayout>
            <AnimatePresence exitBeforeEnter key={router.route}>
                <Component {...pageProps} />
            </AnimatePresence>
        </AnimateSharedLayout>
    );
}

export default VTHellWebUIAppContext;
