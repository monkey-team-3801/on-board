import React, { useEffect, useRef } from "react";
import "./StreamVideo.less";

type Props = {
    muted: boolean;
    stream: MediaStream | undefined;
    className?: string;
};

/**
 * Component which displays the screen of a sharing user.
 */
export const StreamVideo: React.FunctionComponent<Props> = ({
    muted,
    stream,
    className,
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

    return (
        <video
            className={`${className ? className : undefined} stream-video`}
            ref={videoRef}
            muted={muted}
        />
    );
};
