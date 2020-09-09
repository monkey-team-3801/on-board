import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

export const useMyPeer: () => [
    Peer,
    React.RefObject<HTMLVideoElement>
] = () => {
    const [myPeer, setPeer] = useState<Peer>(() => new Peer());
    // My stream
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: true,
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

        myPeer.on("open", () => {
            setPeer(myPeer);
        });

    }, [myPeer, videoRef]);
    return [myPeer, videoRef];
};
