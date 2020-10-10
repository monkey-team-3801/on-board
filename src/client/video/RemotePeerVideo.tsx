import React, { useEffect, useRef } from "react";
import { PeerId } from "../hooks/useMyPeer";
import { addPeer, peerStreams } from "../peer/";

type Props = {
    peerId: PeerId;
    myPeerId: PeerId;
};

export const RemotePeerVideo: React.FunctionComponent<Props> = ({ peerId, myPeerId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        const test = async () => {
            if (myPeerId) {
                await addPeer(peerId);
                if (videoRef.current) {
                    videoRef.current.srcObject = peerStreams.get(peerId)!;
                    videoRef.current.addEventListener("loadedmetadata", () => {
                        videoRef.current?.play();
                    });
                }
            }
        };
        test();
    }, [peerId, myPeerId]);

    return <video ref={videoRef} />;
};
