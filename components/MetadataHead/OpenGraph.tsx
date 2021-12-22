import React from "react";

interface OpenGraphProps {
    image?: string;
    title: string;
    url: string;
    description: string;
}

class OpenGraphMeta extends React.Component<OpenGraphProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { title, description, url, image } = this.props;

        const realTitle = title || "Home";
        const realUrl = url || "https://vthui.n4o.xyz";
        const realImage = image || "/assets/opengraph.png";

        return (
            <>
                {realTitle && <meta property="og:title" content={realTitle} />}
                {description && <meta property="og:description" content={description} />}
                {realImage && <meta property="og:image" content={realImage} />}
                <meta property="og:url" content={realUrl} />
                <meta property="og:site_name" content="VTHell WebUI" />
                <meta property="og:type" content="website" />
            </>
        );
    }
}

export default OpenGraphMeta;
