import React from "react";

import OpenGraphMeta from "./OpenGraph";
import TwitterCardsMeta from "./TwitterCard";

function isString(data: any): data is string {
    return typeof data === "string";
}

export interface SEOMetaProps {
    title?: string;
    description?: string;
    image?: string;
    urlPath?: string;
    color?: string;
}

class SEOMetaTags extends React.Component<SEOMetaProps> {
    constructor(props: SEOMetaProps) {
        super(props);
    }

    render() {
        const { title, description, image, urlPath, color } = this.props;

        let realTitle = "Home";
        let realDescription = "A WebUI for VTHell recording tools";
        let realImage = "/assets/opengraph.png";
        let realUrl = null;
        let realColor = "#FF955D";
        if (isString(title)) {
            realTitle = title;
        }
        if (isString(description)) {
            realDescription = description;
        }
        if (isString(image)) {
            realImage = image;
        }
        if (isString(urlPath)) {
            realUrl = urlPath;
        }
        if (isString(color)) {
            realColor = color;
        }

        let url = "https://vthui.n4o.xyz";
        if (isString(urlPath)) {
            if (urlPath.startsWith("/")) {
                url += realUrl;
            } else {
                url += "/" + realUrl;
            }
        }

        return (
            <>
                {realDescription && <meta name="description" content={realDescription} />}
                <meta name="theme-color" content={realColor} />
                <OpenGraphMeta title={realTitle} description={realDescription} url={url} image={realImage} />
                <TwitterCardsMeta title={realTitle} description={realDescription} image={realImage} />
            </>
        );
    }
}

export default SEOMetaTags;
