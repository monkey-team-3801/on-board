import React, { useEffect, useRef } from "react";

type Props = {
    videoStream: MediaStream | undefined;
    mine: boolean;
};

export const Video: React.FunctionComponent<Props> = ({
    videoStream,
    mine,
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

    return <video id={mine ? "my-video" : "peers-video"} ref={videoRef} />;
};
