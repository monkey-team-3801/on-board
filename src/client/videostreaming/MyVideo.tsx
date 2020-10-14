import React, { useContext, useEffect, useRef } from "react";
import { PeerContext } from "../peer";

type Props = {
    videoStream: MediaStream | undefined;
    muted: boolean;
};

export const MyVideo: React.FunctionComponent<Props> = ({ muted }) => {
    // My stream
    const { stream: myStream } = useContext(PeerContext);
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (myStream) {
            if (videoRef.current) {
                videoRef.current.srcObject = myStream;
                videoRef.current.addEventListener("loadedmetadata", () => {
                    videoRef.current?.play();
                });
            }
        }
    }, [myStream]);

    return <video className="my-video" ref={videoRef} muted={muted} />;
};
