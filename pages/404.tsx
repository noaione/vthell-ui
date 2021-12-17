import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import BaseContainer from "@/components/BaseContainer";
import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";

export default function NotFoundPage() {
    const router = useRouter();
    const [currentRoute, setCurrentRoute] = useState(router.route);

    useEffect(() => {
        setCurrentRoute(window.location.pathname);
    }, [router.route]);

    return (
        <>
            <Head>
                <MetadataHead.Base />
                <title>404 :: VTHell WebUI</title>
                <MetadataHead.SEO title="404" description="The requested page cannot be found" />
                <MetadataHead.Prefetch />
            </Head>
            <Navbar mode="error" />
            <main className="antialiased h-full pb-4">
                <BaseContainer className="flex flex-col gap-4 mt-8 mb-6 text-center" removeShadow>
                    <span className="text-2xl font-semibold mx-2">Link Not found :(</span>
                    <div className="mx-2 justify-center">
                        <code className="text-lg text-gray-400">{currentRoute}</code>
                        <span className="ml-1">is not a valid link</span>
                    </div>
                </BaseContainer>
            </main>
        </>
    );
}
