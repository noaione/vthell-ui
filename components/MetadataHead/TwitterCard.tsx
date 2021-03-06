import React from "react";

interface TwitterCardProps {
    image?: string;
    title: string;
    description: string;
}

class TwitterCardsMeta extends React.Component<TwitterCardProps> {
    constructor(props) {
        super(props);
    }

    render() {
        const { title, description, image } = this.props;

        const realTitle = title || "Home";

        return (
            <>
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:creator" content="@nao0809_" />
                <meta name="twitter:title" content={realTitle} />
                {description && <meta property="twitter:description" content={description} />}
                {image && <meta property="twitter:image" content={image} />}
            </>
        );
    }
}

export default TwitterCardsMeta;
