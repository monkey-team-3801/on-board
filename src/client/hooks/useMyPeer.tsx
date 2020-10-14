import { useCallback, useEffect, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { Map } from "immutable";
import { pauseStream, resumeStream, useMediaStream } from "./useMediaStream";
import { PeerData } from "../peer";
import { VideoEvent } from "../../events";
import { UserPeer } from "../../types";

declare var process: any;

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;
const options: Peer.PeerJSOption = {
    host: "/",
    path: "/peerServer",
    secure: process.env.NODE_ENV === "production",
    port: process.env.NODE_ENV === "production" ? 443 : 5000,
};

export const useMyPeer = (
    socket: SocketIOClient.Socket,
    userId: string,
    sessionId: string
): PeerData => {
    const [myPeer, setMyPeer] = useState<Peer | undefined>(
        () => new Peer(options)
    );
    const [myPeerId, setMyPeerId] = useState<PeerId>("");
    const [peerCalls, setPeerCalls] = useState<Map<string, MediaConnection>>(
        Map()
    );
    const [peerStreams, setPeerStreams] = useState<Map<string, MediaStream>>(
        Map()
    );
    const [myStream, enableStream, disableStream] = useMediaStream();
    const cleanUp = useCallback(() => {
        if (myPeer) {
            myPeer.disconnect();
            setMyPeer(undefined);
            setPeerStreams(peerStreams.clear());
            peerCalls.forEach((call) => {
                call.close();
            });
            setPeerCalls(peerCalls.clear());
            myPeer.destroy();
            disableStream();
            console.log("Cleaning up");
        }
    }, [disableStream, myPeer, peerCalls, peerStreams]);

    const setupPeer = useCallback(() => {
        console.log("Setup peer");
        if (!myPeer) {
            setMyPeer(new Peer(options));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                console.log(error);
                //cleanUp();
            });
            myPeer.on("open", (id) => {
                setMyPeerId(id);
                socket.emit(VideoEvent.USER_JOIN_ROOM, {
                    sessionId,
                    userId,
                    peerId: myPeerId,
                });
            });
        }
    }, [myPeer, cleanUp, socket, sessionId, userId, myPeerId]);
    useEffect(() => {
        if (myPeer) {
            myPeer.on("call", (call) => {
                if (myStream) {
                    console.log(
                        "Answering call to peer",
                        call.peer,
                        "with my stream",
                        myStream
                    );
                    call.answer(myStream);
                    setPeerCalls((prev) => prev.set(call.peer, call));
                }
                call.on("stream", (stream) => {
                    console.log("OTHER CALL Receiving stream from", call.peer);
                    setPeerStreams((prev) => prev.set(call.peer, stream));
                });
            });
        }
    }, [myPeer, myStream]);
    const addPeer = useCallback<(peerId: PeerId) => void>(
        async (peerId) => {
            if (peerCalls.has(peerId)) {
                return;
            }
            if (!myStream) {
                await enableStream();
            }
            if (myStream) {
                const call = myPeer?.call(peerId, myStream);
                if (!call) {
                    console.log("Call is undefined");
                    return;
                } else {
                    console.log("Sending peer", peerId, "my stream");
                }
                setPeerCalls((prev) => prev.set(peerId, call));
                console.log("Connecting to Peer", peerId);
                call.on("stream", (stream) => {
                    console.log("MY CALL Receiving stream from", peerId);
                    setPeerStreams((prev) => prev.set(peerId, stream));
                });
                call.on("close", () => {
                    console.log("disconnecting from", peerId);
                    setPeerCalls((prev) => prev.delete(peerId));
                    setPeerStreams((prev) => prev.delete(peerId));
                });
                call.on("error", (error) => {
                    console.log("Call error", error);
                    setPeerCalls((prev) => prev.delete(peerId));
                    setPeerStreams((prev) => prev.delete(peerId));
                });
            }
        },
        [myStream, peerCalls, myPeer, enableStream]
    );
    const removePeer = useCallback<(peerId: PeerId) => void>(
        (peerId) => {
            setPeerStreams((prev) => prev.delete(peerId));
            const remoteCall = peerCalls.get(peerId);
            remoteCall?.close();
            setPeerCalls((prev) => prev.delete(peerId));
        },
        [peerCalls]
    );

    const onSocketAddUser = useCallback(
        async (userPeer: UserPeer) => {
            console.log("Calling on socket add user");
            console.log("new peer", userPeer.peerId);
            addPeer(userPeer.peerId);
        },
        [addPeer]
    );

    const onSocketRemoveUser = useCallback(
        (userPeer: UserPeer) => {
            console.log("User leaving room");
            removePeer(userPeer.peerId);
        },
        [removePeer]
    );
    const onUserStopSharing = useCallback(
        (peerId: PeerId) => {
            console.log("received user", peerId, "turned of camera");
            const peerStream = peerStreams.get(peerId);
            if (peerStream) {
                pauseStream(peerStream);
            }
        },
        [peerStreams]
    );

    const onUserStartSharing = useCallback(
        (peerId: PeerId) => {
            console.log("received user", peerId, "turn on camera");

            const peerStream = peerStreams.get(peerId);
            if (peerStream) {
                resumeStream(peerStream);
            }
        },
        [peerStreams]
    );
    // Handle socket interactions
    useEffect(() => {
        // Listen to update event
        console.log("Listening, socket connected:", socket.connected);
        socket.on(VideoEvent.USER_JOIN_ROOM, onSocketAddUser);
        socket.on(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
        // socket.on(VideoEvent.USER_STOP_STREAMING, onUserStopSharing);
        // socket.on(VideoEvent.USER_START_STREAMING, onUserStartSharing);
        socket.emit(VideoEvent.USER_JOIN_ROOM, { sessionId, userId: myPeerId });
        return () => {
            socket.off(VideoEvent.USER_JOIN_ROOM, onSocketAddUser);
            socket.off(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
            // socket.off(VideoEvent.USER_STOP_STREAMING, onUserStopSharing);
            // socket.off(VideoEvent.USER_START_STREAMING, onUserStartSharing);
        };
    }, [
        socket,
        onSocketAddUser,
        onSocketRemoveUser,
        onUserStopSharing,
        sessionId,
        myPeerId,
    ]);
    return {
        peer: myPeer,
        peerId: myPeerId,
        stream: myStream,
        peerCalls,
        peerStreams,
        addPeer,
        removePeer,
        enableStream,
        disableStream,
        cleanUp,
    };
};
