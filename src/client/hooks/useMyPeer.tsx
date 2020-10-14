import { useCallback, useEffect, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { Map } from "immutable";
import { useMediaStream } from "./useMediaStream";
import { PeerData } from "../peer";
import { VideoEvent } from "../../events";
import { UserPeer, VideoPeersResponseType } from "../../types";
import { useFetch } from "./useFetch";
import { requestIsLoaded } from "../utils";

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
    const [myPeer] = useState<Peer>(() => new Peer(options));
    const [myPeerId, setMyPeerId] = useState<PeerId>("");
    const [peerCalls, setPeerCalls] = useState<Map<string, MediaConnection>>(
        Map()
    );
    const [peerStreams, setPeerStreams] = useState<Map<string, MediaStream>>(
        Map()
    );
    const [response] = useFetch<
        VideoPeersResponseType,
        { sessionId: string; userId: string }
    >("/videos/peers", { sessionId, userId });
    const [myStream, enableStream, disableStream] = useMediaStream();
    const cleanUp = useCallback(() => {
        if (myPeer) {
            myPeer.disconnect();
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

    // const setupPeer = useCallback(() => {
    //     console.log("Setup peer");
    //     if (!myPeer) {
    //         setMyPeer(new Peer(options));
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

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
                console.log("error:", error);
                //cleanUp();
            });
            myPeer.on("open", (id) => {
                setMyPeerId(id);
            });
        }
    }, [cleanUp, myPeer]);
    useEffect(() => {
        if (myStream && myPeerId) {
            socket.emit(VideoEvent.USER_JOIN_ROOM, {
                sessionId,
                userId,
                peerId: myPeerId,
            });
        }
    }, [myStream, myPeerId, socket, sessionId, userId]);
    useEffect(() => {
        if (myPeerId) {
            myPeer.on("call", (call) => {
                if (myStream) {
                    call.answer(myStream);
                    setPeerCalls((prev) => prev.set(call.peer, call));
                }
                call.on("stream", (stream) => {
                    setPeerStreams((prev) => prev.set(call.peer, stream));
                });
            });
        }
    }, [myPeer, myStream, myPeerId]);
    const addPeer = useCallback<(peerId: PeerId) => void>(
        async (peerId) => {
            if (!myPeerId || myPeerId === peerId) {
                return;
            }
            if (peerCalls.has(peerId)) {
                return;
            }
            if (!myStream) {
                await enableStream();
            }
            if (myStream) {
                console.log("finished add peer check");
                const call = myPeer?.call(peerId, myStream);
                if (!call) {
                    console.log("Call is undefined");
                    return;
                } else {
                    console.log("Sending peer", peerId, "my stream");
                }
                setPeerCalls((prev) => prev.set(peerId, call));
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
        [myPeerId, peerCalls, myStream, enableStream, myPeer]
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
            console.log("new peer", userPeer.peerId, userPeer);
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
    // const onUserStopSharing = useCallback(
    //     (peerId: PeerId) => {
    //         console.log("received user", peerId, "turned of camera");
    //         const peerStream = peerStreams.get(peerId);
    //         if (peerStream) {
    //             pauseStream(peerStream);
    //         }
    //     },
    //     [peerStreams]
    // );
    //
    // const onUserStartSharing = useCallback(
    //     (peerId: PeerId) => {
    //         console.log("received user", peerId, "turn on camera");
    //
    //         const peerStream = peerStreams.get(peerId);
    //         if (peerStream) {
    //             resumeStream(peerStream);
    //         }
    //     },
    //     [peerStreams]
    // );
    useEffect(() => {
        if (requestIsLoaded(response) && myPeerId && myStream) {
            console.log(
                "Adding peers from response",
                myPeerId,
                response.data.peers
            );
            for (const usePeer of response.data.peers) {
                addPeer(usePeer.peerId);
            }
        }
    }, [response, myPeerId, myStream, addPeer]);
    // Handle socket interactions
    useEffect(() => {
        // Listen to update event
        socket.on(VideoEvent.USER_JOIN_ROOM, onSocketAddUser);
        socket.on(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
        // socket.on(VideoEvent.USER_STOP_STREAMING, onUserStopSharing);
        // socket.on(VideoEvent.USER_START_STREAMING, onUserStartSharing);
        return () => {
            socket.off(VideoEvent.USER_JOIN_ROOM, onSocketAddUser);
            socket.off(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
            // socket.off(VideoEvent.USER_STOP_STREAMING, onUserStopSharing);
            // socket.off(VideoEvent.USER_START_STREAMING, onUserStartSharing);
        };
    }, [socket, onSocketAddUser, onSocketRemoveUser, sessionId, myPeerId]);
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
