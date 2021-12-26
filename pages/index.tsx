import BackTopTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";
import ToastManager from "@/components/ToastManager";
import HomeContainer from "@/containers/HomeContainer";
import Head from "next/head";
import React from "react";

export default function THellHomepage() {
    return (
        <React.Fragment key="VTHellHomepage">
            <Head>
                <MetadataHead.Base />
                <title>Home :: VTHell API</title>
                <MetadataHead.SEO />
                <MetadataHead.Prefetch />
            </Head>
            <Navbar />
            <HomeContainer />
            <ToastManager duration={5000} />
            <BackTopTop startAt={300} />
            <Footer />
        </React.Fragment>
    );
}
