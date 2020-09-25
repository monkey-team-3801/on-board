import { useCallback, useEffect, useState } from "react";
import Peer from "peerjs";
import { cleanup } from "@testing-library/react";

declare var process: any;

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;

export const useMyPeer: () => [Peer | undefined, PeerId, () => void] = () => {
    // TODO: change hard coded port
    const options: Peer.PeerJSOption = {
        host: window.location.hostname,
        path: "/peerServer",
        secure: process.env.NODE_ENV === "production",
    };

    console.log("env", process.env.NODE_ENV);

    const [myPeer, setMyPeer] = useState<Peer | undefined>(
        () => new Peer(options)
    );
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
                // myPeer.reconnect();
                cleanup();
                setupPeer();
            });

            myPeer.on("close", () => {
                //cleanUp();
                console.log("closed");
            });

            myPeer.on("error", (error) => {
                console.log("errored");
                console.log(error);
                //cleanUp();
            });
            myPeer.on("open", (id) => {
                setMyPeerId(id);
                // setMyPeer(myPeer);
            });
        }
    }, [myPeer, cleanUp, setupPeer]);
    return [myPeer, myPeerId, setupPeer];
};
