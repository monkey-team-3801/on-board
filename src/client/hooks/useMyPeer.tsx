import { useCallback, useEffect, useState } from "react";
import Peer from "peerjs";

declare var process: any;

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;

export const useMyPeer: () => [Peer | undefined, PeerId, () => void] = () => {
    // TODO: change hard coded port
    const options: Peer.PeerJSOption = {
        host: window.location.hostname,
        path: "/peerServer",
        secure: process.env.NODE_ENV === "production",
        port: process.env.NODE_ENV === "production" ? undefined : 5000,
    };

    const [myPeer, setMyPeer] = useState<Peer | undefined>();
    const [myPeerId, setMyPeerId] = useState<PeerId>("");
    const cleanUp = useCallback(() => {
        if (myPeer) {
            myPeer.disconnect();
            myPeer.destroy();
            setMyPeer(undefined);
            console.log("Cleaning up");
        }
    }, [myPeer]);

    const setupPeer = useCallback(() => {
        console.log("Setup peer");
        if (!myPeer) {
            setMyPeer(new Peer(options));
        }
    }, []);

    useEffect(() => {
        if (myPeer) {
            myPeer.on("disconnected", () => {
                myPeer.reconnect();
            });

            myPeer.on("close", () => {
                cleanUp();
                console.log("closed");
            });

            myPeer.on("error", (error) => {
                console.log("errored");
                cleanUp();
                console.log(error);
            });
            myPeer.on("open", (id) => {
                console.log("open");
                setMyPeerId(id);
                // setMyPeer(myPeer);
            });
        }
    }, [myPeer, cleanUp]);
    return [myPeer, myPeerId, setupPeer];
};
