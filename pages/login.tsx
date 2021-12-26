import Head from "next/head";
import React from "react";

import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";
import { withSessionSSR } from "@/lib/session";
import LoginContainer from "@/containers/LoginContainer";

export const getServerSideProps = withSessionSSR(async ({ req }) => {
    // @ts-ignore
    const user = req.session.user;
    if (!user) {
        return { props: { loggedIn: false } };
    }

    if (!user.isLoggedIn) {
        return { props: { loggedIn: true } };
    }
    if (user.user !== "admin") {
        return { props: { loggedIn: false } };
    }

    return {
        redirect: {
            destination: "/scheduler",
            permanent: false,
        },
    };
});

export default function LoginPage() {
    return (
        <>
            <Head>
                <MetadataHead.Base />
                <title>Login :: VTHell WebUI</title>
                <MetadataHead.SEO title="Login" description="Access restricted pages" />
                <MetadataHead.Prefetch />
            </Head>
            <Navbar mode="login" />
            <LoginContainer />
        </>
    );
}
