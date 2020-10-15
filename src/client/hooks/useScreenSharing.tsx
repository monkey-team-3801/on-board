import { useEffect, useCallback, useState } from "react";
import Peer from "peerjs";
import { peerOptions } from "../peer/peer";
import { VideoEvent } from "../../events";
import socketIOClient from "socket.io-client";

declare global {
    interface MediaDevices {
        getDisplayMedia: (
            constraints?: MediaStreamConstraints
        ) => Promise<MediaStream>;
    }
}

export type ScreenSharingData = {
    peer: Peer | undefined;
    peerId: string;
    screenStream: MediaStream | undefined;
    setupScreenSharing: () => void;
    stopScreenSharing: () => void;
};

const socket = socketIOClient("/");

export const useScreenSharing = (
    userId: string,
    sessionId: string
): ScreenSharingData => {
    const [peer, setPeer] = useState<Peer | undefined>(undefined);
    const [peerId, setPeerId] = useState<string>("");
    const [screenStream, setScreenStream] = useState<MediaStream | undefined>(
        undefined
    );
    const setupScreenSharing = useCallback(async () => {
        // Get stream
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
        setScreenStream(stream);
        // Create new peer
        const newPeer = new Peer(peerOptions);
        newPeer.on("open", (peerId) => {
            setPeerId(peerId);
            // Send socket event to server to notify screen sharing
            socket.emit(VideoEvent.USER_START_SCREEN_SHARING, {
                peerId,
                userId,
                sessionId,
            });
        });
        newPeer.on("error", (err) => {
            console.log(err);
        });
        // Answer people's call
        newPeer.on("call", (call) => {
            call.answer(screenStream);
        });
        setPeer(newPeer);
    }, [screenStream, sessionId, userId]);

    const stopScreenSharing = useCallback(() => {
        // Stop stream
        if (screenStream) {
            screenStream.getTracks().forEach((track) => {
                track.stop();
            });
            setScreenStream(undefined);
        }
        // destroy peer
        if (peer) {
            peer.destroy();
            setPeer(undefined);
            // Notify server
            socket.emit(VideoEvent.USER_STOP_STREAMING, {
                peerId,
                userId,
                sessionId,
            });
            setPeerId("");
        }
    }, [screenStream, peer, peerId, sessionId, userId]);
    // TODO: in other peers, must NOT put this peer to the list of peer streams,
    //  instead have a separate way to track the stream
    return {
        peer,
        peerId,
        screenStream,
        setupScreenSharing,
        stopScreenSharing,
    };
};
