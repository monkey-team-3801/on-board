import { useEffect, useCallback, useState, useContext } from "react";
import Peer from "peerjs";
import { PeerContext, peerOptions } from "../peer/peer";
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
    sessionId: string
): ScreenSharingData => {
    const [mySharingPeer, setMySharingPeer] = useState<Peer | undefined>(undefined);
    const [mySharingPeerId, setMySharingPeerId] = useState<string>("");
    const [screenStream, setScreenStream] = useState<MediaStream | undefined>(
        undefined
    );
    const {peerId: myPeerId} = useContext(PeerContext);
    const [sharing, setSharing] = useState<boolean>(false);
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
    }, [sessionId, userId, myPeerId, sharing]);

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
    // TODO: in other peers, must NOT put this peer to the list of peer streams,
    //  instead have a separate way to track the stream
    return {
        peer: mySharingPeer,
        peerId: mySharingPeerId,
        screenStream,
        sharing,
        setupScreenSharing,
        stopScreenSharing,
    };
};
