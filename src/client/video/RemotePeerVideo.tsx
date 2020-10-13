import React, { useContext, useEffect, useRef } from "react";
import { PeerId } from "../hooks/useMyPeer";
import { PeerContext } from "../peer";

type Props = {
    peerId: PeerId;
};

export const RemotePeerVideo: React.FunctionComponent<Props> = ({ peerId }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { peerId: myPeerId, addPeer, peerStreams } = useContext(PeerContext);
    const playVideo = () => {
        videoRef.current?.play();
    };
    useEffect(() => {

        const setupStream = async () => {
            if (myPeerId) {
                await addPeer(peerId);
                if (videoRef.current) {
                    videoRef.current.srcObject = peerStreams.get(peerId)!;
                    console.log(peerStreams.get(peerId));
                    videoRef.current.addEventListener("loadedmetadata", playVideo);
                }
            }
        };
        setupStream();
        return () => videoRef.current?.removeEventListener("loadedmetadata", playVideo);

    }, [peerId, myPeerId, addPeer, peerStreams]);

    return <video ref={videoRef} />;
};
