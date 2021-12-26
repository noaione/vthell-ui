import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";
import ToastManager from "@/components/ToastManager";
import NewJobContainer from "@/containers/NewJobContainer";
import Head from "next/head";
import React from "react";

export default function AddNewSchedulePage() {
    return (
        <>
            <Head>
                <MetadataHead.Base />
                <title>New Job :: VTHell WebUI</title>
                <MetadataHead.SEO title="New Job" urlPath="/new" description="Create new job for recording" />
                <MetadataHead.Prefetch />
            </Head>
            <Navbar mode="create" />
            <NewJobContainer />
            <ToastManager />
        </>
    );
}
