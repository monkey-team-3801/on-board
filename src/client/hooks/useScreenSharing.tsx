import { useCallback, useState } from "react";
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
    sharing: boolean;
    setupScreenSharing: () => void;
    stopScreenSharing: () => void;
};

const socket = socketIOClient("/");

export const useScreenSharing = (
    userId: string,
    sessionId: string,
    onDenied: (reason: string) => void = (reason) => console.log(reason)
): ScreenSharingData => {
    const [mySharingPeer, setMySharingPeer] = useState<Peer | undefined>(
        undefined
    );
    const [mySharingPeerId, setMySharingPeerId] = useState<string>("");
    const [screenStream, setScreenStream] = useState<MediaStream | undefined>(
        undefined
    );
    const [sharing, setSharing] = useState<boolean>(false);

    const stopScreenSharing = useCallback(() => {
        // Stop stream
        if (screenStream) {
            screenStream.getTracks().forEach((track) => {
                track.stop();
            });
            setScreenStream(undefined);
        }
        // destroy peer
        if (mySharingPeer) {
            mySharingPeer.destroy();
            setMySharingPeer(undefined);
            // Notify server
            socket.emit(VideoEvent.USER_STOP_STREAMING, {
                peerId: mySharingPeerId,
                userId,
                sessionId,
            });
            setMySharingPeerId("");
        }
        setSharing(false);
    }, [screenStream, mySharingPeer, mySharingPeerId, sessionId, userId]);

    const setupScreenSharing = useCallback(async () => {
        // Get stream
        if (sharing) {
            return;
        }
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
            setScreenStream(stream);
        } catch (e) {
            console.log("Error getting screen from user", e);
            return;
        }

        // Create new peer
        const newPeer = new Peer(peerOptions);
        newPeer.on("open", (peerId) => {
            setMySharingPeerId(peerId);
            // Send socket event to server to notify screen sharing
            socket.on(
                VideoEvent.OPERATION_DENIED,
                ({ reason }: { reason: string }) => {
                    stopScreenSharing();
                    onDenied(reason);
                }
            );
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
            call.answer(stream);
        });
        setMySharingPeer(newPeer);
        setSharing(true);
    }, [sessionId, userId, sharing, onDenied, stopScreenSharing]);

    return {
        peer: mySharingPeer,
        peerId: mySharingPeerId,
        screenStream,
        sharing,
        setupScreenSharing,
        stopScreenSharing,
    };
};
