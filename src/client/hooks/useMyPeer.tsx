import { useCallback, useEffect, useState } from "react";
import Peer from "peerjs";

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;

export const useMyPeer: () => [Peer, PeerId] = () => {
    // TODO: change hard coded port
    const options: Peer.PeerJSOption = {
        host: window.location.hostname,
        //port: Number(window.location.port) || 5000,
        path: "/peerServer",
        secure: process.env.NODE_ENV === "production"
    };
    if (process.env.NODE_ENV === "development") {
        options.port = Number(process.env.PORT) || 5000;
    }
    console.log(options);
    console.log("port:", window.location.port);
    const [myPeer, setMyPeer] = useState<Peer>(
        () =>
            new Peer(options)
    );
    const [myPeerId, setMyPeerId] = useState<PeerId>("");
    const cleanUp = useCallback(() => {
        if (myPeer) {
            myPeer.disconnect();
            myPeer.destroy();
            console.log("Cleaning up");
        }
    }, [myPeer]);

    useEffect(() => {
        myPeer.on("disconnected", () => {
            myPeer.reconnect();
        });

        myPeer.on("close", () => {
            cleanUp();
        });

        myPeer.on("error", (error) => {
            //cleanUp();
            console.log(error);
        });
        myPeer.on("open", (id) => {
            console.log("Peer opening", id);
            setMyPeerId(id);
            setMyPeer(myPeer);
        });
    }, [myPeer, cleanUp]);
    return [myPeer, myPeerId];
};
