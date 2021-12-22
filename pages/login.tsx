import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";

import BaseContainer from "@/components/BaseContainer";
import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";
import { withSessionSSR } from "@/lib/session";
import Buttons from "@/components/Buttons";

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
    const [passbox, setPassbox] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);

        const body = {
            username: "admin",
            password: e.currentTarget.password.value,
        };
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (res.status === 200) {
            const userObj = await res.json();
            if (userObj?.user) {
                router.push("/scheduler");
            } else {
                setError("Invalid password");
            }
        } else {
            setError("Incorrect password!");
        }
        setSubmitting(false);
    };

    return (
        <>
            <Head>
                <MetadataHead.Base />
                <title>Login :: VTHell WebUI</title>
                <MetadataHead.SEO title="Login" description="Access restricted pages" />
                <MetadataHead.Prefetch />
            </Head>
            <Navbar mode="login" />
            <main className="antialiased h-full pb-4">
                <BaseContainer className="flex flex-col gap-4 mt-8 mb-6 text-center" removeShadow>
                    <span className="text-2xl font-semibold mx-2">You shall not pass!</span>
                    <label>
                        <span className="text-lg text-gray-400">You are not logged in.</span>
                        <span className="ml-1">Please login to access restricted pages.</span>
                    </label>
                    {error.length > 0 && (
                        <label className="flex flex-col justify-center">
                            <span className="text-gray-400">An error occured</span>
                            <span className="text-red-400">{error}</span>
                        </label>
                    )}
                    <form className="mx-auto w-full" onSubmit={onSubmit}>
                        <label className="inline-flex flex-col justify-center w-full">
                            <input
                                name="password"
                                className="form-input bg-gray-700/40 mx-3 block mt-1 text-gray-100 border-2 border-gray-500 focus:border-blue-400 transition duration-200"
                                type="password"
                                value={passbox}
                                onChange={(ev) => setPassbox(ev.target.value)}
                                placeholder="**************"
                            />
                        </label>
                        <Buttons className="mt-4 mx-3" btnType="primary" disabled={submitting}>
                            Login
                        </Buttons>
                    </form>
                </BaseContainer>
            </main>
        </>
    );
}
