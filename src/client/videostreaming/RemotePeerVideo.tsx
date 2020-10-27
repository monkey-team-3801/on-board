import React, { useContext, useEffect, useRef } from "react";
import { PeerId } from "../hooks/useMyPeer";
import { PeerContext } from "../peer";

type Props = {
    // User peer id.
    peerId: PeerId;
    // Additional classes to inject in to the video HTML tag.
    className?: string;
};

/**
 * Component for displaying a remote user stream.
 */
export const RemotePeerVideo: React.FunctionComponent<Props> = ({
    peerId,
    className,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { peerId: myPeerId, addPeer, peerStreams } = useContext(PeerContext);
    const playVideo = () => {
        videoRef.current?.play();
    };
    useEffect(() => {
        const currentRef = videoRef.current;
        const setupStream = async () => {
            if (myPeerId) {
                await addPeer(peerId);
                if (currentRef) {
                    currentRef.srcObject = peerStreams.get(peerId)!;
                    console.log(peerStreams.get(peerId));
                    currentRef.addEventListener("loadedmetadata", playVideo);
                }
            }
        };
        setupStream();
        return () =>
            currentRef?.removeEventListener("loadedmetadata", playVideo);
    }, [peerId, myPeerId, addPeer, peerStreams]);

    return (
        <div className="stream-video-wrapper">
            <video
                ref={videoRef}
                className={`${className ? className : ""} stream-video`}
            />
        </div>
    );
};
