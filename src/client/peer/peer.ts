import Peer, { MediaConnection } from "peerjs";
import { createContext, useContext } from "react";

const options: Peer.PeerJSOption = {
    host: "/",
    path: "/peerServer",
    secure: process.env.NODE_ENV === "production",
    port: process.env.NODE_ENV === "production" ? 443 : 5000,
};

const defaultConstraints: MediaStreamConstraints = {
    video: {
        width: 480,
        height: 360,
        frameRate: 8,
        aspectRatio: 1.3333333,
    },
    audio: {
        noiseSuppression: true,
        echoCancellation: true,
    },
};

export const PeerContext = createContext<Peer | undefined>(undefined);
export const PeerCallContext = createContext<Map<string, MediaConnection>>(new Map());
export const PeerStreamContext = createContext<Map<string, MediaStream>>(new Map());
const peerCalls: Map<string, MediaConnection> = new Map<
    string,
    Peer.MediaConnection
>();
export const peerStreams: Map<string, MediaStream> = new Map<
    string,
    MediaStream
>();
export let myStream: MediaStream | undefined = undefined;

export const usePeer = () => {

}
export const enableMyPeer = async (setPeerId: (peerId: string) => void) => {
    myStream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
    myPeer = new Peer(options);
    myPeer.on("call", (call) => {
        call.answer(myStream);
        peerCalls.set(call.peer, call);
        call.on("stream", (remoteStream) => {
            peerStreams.set(call.peer, remoteStream);
        });
    });

    myPeer.on("disconnected", () => {
        disableMyPeer();
    });

    myPeer.on("close", () => {
        disableMyPeer();
    });

    myPeer.on("error", (error) => {
        console.log(error);
    });
    myPeer.on("open", (id) => {
        setPeerId(id);
    });
};

export const disableMyPeer = () => {
    if (myStream) {
        myStream.getTracks().forEach((track) => {
            track.stop();
        });
    }
    peerStreams.clear();
    peerCalls.clear();
    myPeer?.destroy();
};

export const addPeer = async (myPeer: Peer, peerId: string) => {
    if (!myPeer) {
        return;
    }
    if (!myStream) {
        myStream = await navigator.mediaDevices.getUserMedia(
            defaultConstraints
        );
    }
    console.log("calling peer", peerId);
    const call = myPeer.call(peerId, myStream);
    if (!call) {
        console.log("Call is undefined");
        return;
    }
    peerCalls.set(peerId, call);
    console.log("Connecting to Peer", peerId);
    call.on("stream", (stream) => {
        console.log("MY CALL Receiving stream from", peerId);
        peerStreams.set(peerId, stream);
    });
    call.on("close", () => {
        console.log("disconnecting from", peerId);
        peerCalls.delete(peerId);
        peerStreams.delete(peerId);
    });
    call.on("error", (error) => {
        console.log("Call error", error);
        peerCalls.delete(peerId);
        peerStreams.delete(peerId);
    });
};

export const removePeer = (peerId: string) => {
    peerStreams.delete(peerId);
    const remoteCall = peerCalls.get(peerId);
    remoteCall?.close();
    peerCalls.delete(peerId);
};
