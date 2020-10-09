import React, { useEffect, useRef } from "react";
import { PeerId } from "../hooks/useMyPeer";

type Props = {
    videoStream: MediaStream | undefined;
    muted: boolean;
    mine: boolean;
    peerId: PeerId;
};

export const Video: React.FunctionComponent<Props> = ({
    videoStream,
    mine,
    muted,
    peerId
}) => {
    // My stream
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoStream) {
            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
                videoRef.current.addEventListener("loadedmetadata", () => {
                    videoRef.current?.play();
                });
            }
        }
    }, [videoStream]);

    return (
        <video
            className={mine ? "my-video" : "peers-video"}
            ref={videoRef}
            muted={muted}
        />
    );
};
