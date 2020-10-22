import Peer, { MediaConnection } from "peerjs";
import { createContext } from "react";
import { Map } from "immutable";
import { PeerId } from "../hooks/useMyPeer";

export const peerOptions: Peer.PeerJSOption = {
    host: "/",
    path: "/peerServer",
    secure: process.env.NODE_ENV === "production",
    port: process.env.NODE_ENV === "production" ? 443 : 5000,
};

export type PeerData = {
    peer: Peer | undefined;
    peerId: PeerId;
    stream: MediaStream | undefined;
    peerCalls: Map<string, MediaConnection>;
    peerStreams: Map<string, MediaStream>;
    sharingCalls: Map<
        string,
        {
            peerId: string;
            call: MediaConnection;
        }
    >;
    sharingStreams: Map<
        string,
        {
            peerId: string;
            stream: MediaStream;
        }
    >;
    userIdToPeerIdMap: Map<string, string>;
    addPeer: (peerId: PeerId, theirUserId?: string) => void;
    removePeer: (peerId: PeerId, theirUserId?: string) => void;
    enableStream: () => void;
    disableStream: () => void;
    cleanUp: () => void;
};

export const PeerContext = createContext<PeerData>({
    peer: undefined,
    peerId: "",
    stream: undefined,
    peerCalls: Map(),
    peerStreams: Map(),
    sharingCalls: Map(),
    sharingStreams: Map(),
    userIdToPeerIdMap: Map(),
    addPeer: (peerId) => {},
    removePeer: (peerId) => {},
    enableStream: () => {},
    disableStream: () => {},
    cleanUp: () => {},
});
