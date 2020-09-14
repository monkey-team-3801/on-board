import { useCallback, useEffect, useState } from "react";
import Peer from "peerjs";
import { useMediaStream } from "./useMediaStream";

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;

export const useMyPeer: () => [Peer, PeerId, MediaStream | undefined] = () => {
    const [myPeer, setMyPeer] = useState<Peer>(
        () =>
            new Peer({
                host: window.location.hostname,
                port: 5000,
                path: "/peerServer",
            })
    );
    const [stream] = useMediaStream();
    const [myPeerId, setMyPeerId] = useState<PeerId>("");
    const cleanUp = useCallback(() => {
        if (myPeer) {
            myPeer.disconnect();
            myPeer.destroy();
        }
    }, [myPeer]);

    useEffect(() => {
        myPeer.on("disconnected", () => {
            cleanUp();
        });

        myPeer.on("close", () => {
            cleanUp();
        });

        myPeer.on("error", (error) => {
            cleanUp();
        });
        myPeer.on("open", (id) => {
            console.log("Peer opening", id);
            setMyPeerId(id);
            setMyPeer(myPeer);
        });
        return () => cleanUp();
    }, [stream, myPeer, cleanUp]);
    return [myPeer, myPeerId, stream];
};
