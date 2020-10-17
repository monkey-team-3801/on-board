import React, { useEffect, useRef } from "react";
import "./StreamVideo.less";

type Props = {
    muted: boolean;
    stream: MediaStream | undefined;
};

export const StreamVideo: React.FunctionComponent<Props> = ({
    muted,
    stream,
}) => {
    // My stream
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (stream) {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.addEventListener("loadedmetadata", () => {
                    videoRef.current?.play();
                });
            }
        }
    }, [stream]);

    return <video className="stream-video" ref={videoRef} muted={muted} />;
};
