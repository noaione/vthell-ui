import React from "react";
import Head from "next/head";
import MetadataHead from "@/components/MetadataHead";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackTopTop from "@/components/BackToTop";
import RecordsContainer from "@/containers/RecordsContainer";

export default class RecordedStreamPage extends React.Component {
    render(): React.ReactNode {
        return (
            <>
                <Head>
                    <MetadataHead.Base />
                    <title>Records :: VTHell WebUI</title>
                    <MetadataHead.SEO
                        title="Records"
                        urlPath="/records"
                        description="All past recorded stream listing"
                    />
                </Head>
                <Navbar mode="records" />
                <RecordsContainer />
                <BackTopTop startAt={300} />
                <Footer />
            </>
        );
    }
}
