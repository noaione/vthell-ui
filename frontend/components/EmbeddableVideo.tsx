import React from "react";

import { capitalizeLetters, isType } from "../lib/utils";

function colorType(type: string) {
    switch (type) {
        case "youtube":
            return "bg-red-600";
        case "twitch":
            return "bg-purple-600";
        case "mildom":
            return "bg-blue-500";
        case "twitcasting":
            return "bg-blue-600";
        case "bilibili":
            return "bg-blue-400";
        default:
            return "bg-red-600";
    }
}

function isString(value: any): value is string {
    return isType(value as string, "string");
}

export type PlatformType = "youtube" | "twitch" | "twitcasting" | "bilibili" | "mildom";

interface VideoEmbedProps {
    imageClassName?: string;
    platform: PlatformType | "unknown";
    thumbnail?: string;
    status: "live" | "upcoming" | "past" | "video";
    id: string;
    url: string;
    embedNow?: boolean;
}

interface VideoEmbedState {
    embedded: boolean;
}

export default class EmbeddableVideo extends React.Component<VideoEmbedProps, VideoEmbedState> {
    constructor(props) {
        super(props);
        this.generateEmbed = this.generateEmbed.bind(this);
        const { embedNow } = this.props;
        this.state = {
            embedded: embedNow ? true : false,
        };
    }

    generateEmbed() {
        const { id, platform, url, status, imageClassName } = this.props;
        if (platform === "youtube") {
            return (
                <iframe
                    src={"https://www.youtube.com/embed/" + id + "?autoplay=1"}
                    className="absolute top-0 left-0 w-full h-full"
                    title={`YouTube ID ${id}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            );
        } else if (platform === "twitch") {
            if (["live", "upcoming"].includes(status)) {
                return (
                    <iframe
                        src={`https://player.twitch.tv/?channel=${id}&parent=vtuber.ihateani.me`}
                        width="100%"
                        height="100%"
                        title={`Twitch Channel ${id}`}
                        allowFullScreen
                    />
                );
            }
        }

        return (
            <div
                className={`flex flex-col gap-2 items-center place-content-center place-items-center text-center bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 ${
                    isString(imageClassName) && imageClassName
                }`}
            >
                <p className="font-light text-2xl align-middle place-self-center self-center">
                    Sorry, but there&apos;s no Video Embed
                </p>
                <a
                    href={url}
                    className="font-light text-lg align-middle place-self-center self-center text-blue-300 hover:opacity-80 duration-200 transition-opacity"
                >
                    Open Stream/Video
                </a>
            </div>
        );
    }

    render() {
        const { id, thumbnail, imageClassName, platform } = this.props;
        const coloredBlock = colorType(platform);
        const properType = capitalizeLetters(platform);
        return (
            <>
                {this.state.embedded ? (
                    <div className="relative aspect-w-16 aspect-h-9">{this.generateEmbed()}</div>
                ) : (
                    <div id={`embeddable-${id}`} onClick={() => this.setState({ embedded: true })}>
                        <img
                            src={thumbnail}
                            className={`w-full object-cover object-center ${
                                isString(imageClassName) && imageClassName
                            }`}
                            alt={id + " Stream Thumbnail"}
                            loading="lazy"
                        />
                        <span
                            className={`cursor-pointer absolute shadow-lg top-4 right-4 rounded-lg text-white ${coloredBlock} px-2 py-1`}
                        >
                            {properType}
                        </span>
                    </div>
                )}
            </>
        );
    }
}
