import React from "react";
import { withSessionSSR } from "@/lib/session";
import { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";

import ToastManager from "@/components/ToastManager";
import BackTopTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import AutoSchedulerContainer from "@/containers/AutoSchedulerContainer";

export const getServerSideProps = withSessionSSR(async ({ req }) => {
    // @ts-ignore
    const user = req.session.user;
    if (!user) {
        return { props: { loggedIn: false } };
    }

    if (user.isLoggedIn) {
        return { props: { loggedIn: true } };
    }
    if (user.user !== "admin") {
        return { props: { loggedIn: false } };
    }

    return { props: { loggedIn: true } };
});

type InferedSSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function AutoSchedulerPage(props: InferedSSRProps) {
    const { loggedIn } = props;
    return (
        <>
            <Head>
                <MetadataHead.Base />
                <title>Scheduler :: VTHell WebUI</title>
                <MetadataHead.SEO
                    title="Scheduler"
                    urlPath="/scheduler"
                    description={`Auto scheduler settings for VTHell.${
                        loggedIn ? "" : " Please login as admin to adjust."
                    }`}
                />
            </Head>
            <Navbar mode="scheduler" />
            <AutoSchedulerContainer loggedIn={loggedIn} />
            <ToastManager duration={5000} />
            <BackTopTop startAt={300} />
            <Footer />
        </>
    );
}
