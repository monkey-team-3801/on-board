import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;

export const useMyPeer: () => [
    Peer,
    PeerId,
    React.RefObject<HTMLVideoElement>
] = () => {
    const [myPeer, setMyPeer] = useState<Peer>(() => new Peer({
        host: window.location.hostname,
        port: 5000,
        path: "/peerServer",
    }));
    const [myPeerId, setMyPeerId] = useState<PeerId>("");
    // My stream
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: false,
            })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener("loadedmetadata", () => {
                        videoRef.current?.play();
                    });
                }
                myPeer.on("call", call => {
                    call.answer(stream);
                });

            });

    }, [myPeer, videoRef]);
    useEffect(() => {
        myPeer.on("open", (id) => {
            console.log("Peer opening", id);
            setMyPeerId(id);
            setMyPeer(myPeer);
        });
    }, [myPeer]);
    return [myPeer, myPeerId, videoRef];
};
