import React, { useContext, useEffect, useRef } from "react";
import { PeerContext } from "../peer";

type Props = {
    videoStream: MediaStream | undefined;
    muted: boolean;
    mine: boolean;
};

export const Video: React.FunctionComponent<Props> = ({
    mine,
    muted,
}) => {
    // My stream
    const {stream: myStream} = useContext(PeerContext);
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        console.log("testing");
        if (myStream) {
            if (videoRef.current) {
                videoRef.current.srcObject = myStream;
                videoRef.current.addEventListener("loadedmetadata", () => {
                    videoRef.current?.play();
                });
            }
        }
    }, [myStream]);

    return (
        <video
            className={mine ? "my-video" : "peers-video"}
            ref={videoRef}
            muted={muted}
        />
    );
};
