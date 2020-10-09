import {createContext, useContext} from 'react';
import Peer, { MediaConnection } from "peerjs";
import { cleanup } from "@testing-library/react";
import { socket } from "../io";
import { VideoEvent } from "../../events";

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
        echoCancellation: true
    }
};

export let peer: Peer | null = null;
export const peerCalls: Map<string, MediaConnection> = new Map<string, Peer.MediaConnection>();
export const peerStreams: Map<string, MediaStream> = new Map<string, MediaStream>();
let stream: MediaStream | undefined = undefined;

export const enableMyPeer = async () => {
    stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
    peer = new Peer(options);
    peer.on("call", call => {
        call.answer(stream);
        peerCalls.set(call.peer, call);
        call.on("stream", remoteStream => {
            peerStreams.set(call.peer, remoteStream);
        });
    });

    peer.on("disconnected", () => {
        disableMyPeer();
    });

    peer.on("close", () => {
        disableMyPeer();
    });

    peer.on("error", (error) => {
        console.log(error);
    });
    peer.on("open", (id) => {
        socket.emit(VideoEvent.USER_JOIN_ROOM, id);
    });
};

export const disableMyPeer = () => {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    peerStreams.clear();
    peerCalls.clear();
    peer?.destroy();

};

export const addPeer = (peerId: string) => {
    if (!peer) {
        return;
    }
    // TODO: how to continue checking until done
    if (stream) {

        const call = peer.call(peerId, stream);
        if (!call) {
            console.log("Call is undefined");
            return;
        }
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
    }
};
