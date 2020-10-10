import Peer, { MediaConnection } from "peerjs";
import { createContext } from "react";
import { Map } from "immutable";
import { PeerId } from "../hooks/useMyPeer";

export type PeerData = {
    peer: Peer | undefined,
    peerId: PeerId,
    stream: MediaStream | undefined,
    peerCalls: Map<string, MediaConnection>,
    peerStreams: Map<string, MediaStream>,
    addPeer: (peerId: PeerId) => void,
    removePeer: (peerId: PeerId) => void,
    enableStream: () => void,
    disableStream: () => void,
    cleanUp: () => void
}

export const PeerContext = createContext<PeerData>({
    peer: undefined,
    peerId: "",
    stream: undefined,
    peerCalls: Map(),
    peerStreams: Map(),
    addPeer: peerId => {},
    removePeer: peerId => {},
    enableStream: () => {},
    disableStream: () => {},
    cleanUp: () => {}
});
