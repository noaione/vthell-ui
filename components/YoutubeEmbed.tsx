import { isType } from "@/lib/utils";
import React from "react";

interface EmbedProps {
    id: string;
    embedNow?: boolean;
    imageClassName?: string;
}

interface EmbedState {
    embedded: boolean;
}

function isString(value: any): value is string {
    return isType(value as string, "string");
}

export default class YoutubeEmbed extends React.Component<EmbedProps, EmbedState> {
    constructor(props) {
        super(props);
        const { embedNow } = this.props;
        this.state = {
            embedded: embedNow ? true : false,
        };
    }

    render(): React.ReactNode {
        const { id, imageClassName } = this.props;
        const { embedded } = this.state;

        const thumbnail = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

        return (
            <>
                {embedded ? (
                    <div className="relative aspect-video">
                        <iframe
                            src={`https://www.youtube-nocookie.com//embed/${id}?autoplay=1`}
                            className="absolute top-0 left-0 w-full h-full"
                            title={`Youtube Video ${id}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div onClick={() => this.setState({ embedded: true })}>
                        <img
                            src={thumbnail}
                            className={`w-full object-cover object-center ${
                                isString(imageClassName) && imageClassName
                            }`}
                            alt={`YouTube video ${id}`}
                            loading="lazy"
                        />
                        <span className="cursor-pointer absolute shadow-lg top-4 right-4 rounded-lg text-white bg-red-600 px-2 py-1">
                            YouTube
                        </span>
                    </div>
                )}
            </>
        );
    }
}
