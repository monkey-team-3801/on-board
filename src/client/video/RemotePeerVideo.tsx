import React, { useEffect, useRef, useState } from "react";
import { PeerId } from "../hooks/useMyPeer";
import Peer from "peerjs";
import { addPeer, enableMyPeer, peer } from "../peer/peer";

type Props = {
    peerId: PeerId;
    myPeer: Peer;
    myStream: MediaStream
};

export const Video: React.FunctionComponent<Props> = ({
    peerId,
}) => {
    useEffect(() => {

        if (!peer) {
            enableMyPeer();
        }
        addPeer(peerId);
    }, []);
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (remoteStream) {
            if (videoRef.current) {
                videoRef.current.srcObject = remoteStream;
                videoRef.current.addEventListener("loadedmetadata", () => {
                    videoRef.current?.play();
                });
            }
        }
    }, [remoteStream]);

    return (
        <video
            ref={videoRef}
        />
    );
};
