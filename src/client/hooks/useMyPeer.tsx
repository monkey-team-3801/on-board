import { useCallback, useEffect, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { Map } from "immutable";
import { useMediaStream } from "./useMediaStream";
import { PeerData } from "../peer";
import { PrivateVideoRoomShareScreenData, VideoEvent } from "../../events";
import { UserPeer, VideoPeersResponseType } from "../../types";
import { useFetch } from "./useFetch";
import { requestIsLoaded } from "../utils";
import { peerOptions } from "../peer/peer";

declare var process: any;

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;

export const useMyPeer = (
    socket: SocketIOClient.Socket,
    userId: string,
    sessionId: string
): PeerData => {
    const [myPeer] = useState<Peer>(() => new Peer(peerOptions));
    const [myPeerId, setMyPeerId] = useState<PeerId>("");
    const [peerCalls, setPeerCalls] = useState<Map<string, MediaConnection>>(
        Map()
    );
    const [peerStreams, setPeerStreams] = useState<Map<string, MediaStream>>(
        Map()
    );
    const [sharingStreams, setSharingStreams] = useState<
        Map<string, MediaStream>
    >(Map());
    const [sharingCalls, setSharingCalls] = useState<
        Map<string, MediaConnection>
    >(Map());
    const [peerResponse] = useFetch<
        VideoPeersResponseType,
        { sessionId: string; userId: string }
    >("/videos/peers", { sessionId, userId });
    const [sharingResponse] = useFetch<{ [key: string]: string }>(
        `/videos/${sessionId}/sharing`
    );
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
            });

            myPeer.on("error", (error) => {
                console.log("error:", error);
                //cleanUp();
            });
            myPeer.on("open", (id) => {
                setMyPeerId(id);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myPeer]);
    useEffect(() => {
        if (myStream && myPeerId) {
            socket.emit(VideoEvent.USER_JOIN_ROOM, {
                sessionId,
                userId,
                peerId: myPeerId,
            });
        }
    }, [myStream, myPeerId, sessionId, userId, socket]);
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
                const call = myPeer?.call(peerId, myStream);
                if (!call) {
                    return;
                }
                setPeerCalls((prev) => prev.set(peerId, call));
                call.on("stream", (stream) => {
                    setPeerStreams((prev) => prev.set(peerId, stream));
                });
                call.on("close", () => {
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

    const addSharingPeer = useCallback<(peerId: string) => void>(
        async (peerId) => {
            if (!myStream) {
                await enableStream();
            }
            if (!myPeerId) {
                return;
            }
            const call = myPeer.call(peerId, myStream!);
            if (!call) {
                return;
            }
            setSharingCalls(sharingCalls.set(peerId, call));
            call.on("stream", (stream) => {
                setSharingStreams(sharingStreams.set(peerId, stream));
            });
            call.on("close", () => {
                setSharingCalls(sharingCalls.delete(peerId));
                setSharingStreams(sharingStreams.delete(peerId));
            });
            call.on("error", (error) => {
                console.log("streaming peer call error", error);
                setSharingStreams(sharingStreams.delete(peerId));
                setSharingCalls(sharingCalls.delete(peerId));
            });
        },
        [enableStream, myPeer, sharingCalls, sharingStreams, myPeerId, myStream]
    );

    const removeSharingPeer = useCallback<(peerId: string) => void>(
        (peerId) => {
            const call = sharingCalls.get(peerId);
            if (call) {
                call.close();
            }
            setSharingCalls(sharingCalls.delete(peerId));
            setSharingStreams(sharingStreams.delete(peerId));
        },
        [sharingCalls, sharingStreams]
    );

    const onSocketAddPeer = useCallback(
        async (userPeer: UserPeer) => {
            addPeer(userPeer.peerId);
        },
        [addPeer]
    );

    const onSocketRemovePeer = useCallback(
        (userPeer: UserPeer) => {
            removePeer(userPeer.peerId);
        },
        [removePeer]
    );

    const onSocketUserStartScreenShare = useCallback(
        (userData: PrivateVideoRoomShareScreenData) => {
            const { peerId } = userData;
            addSharingPeer(peerId);
        },
        [addSharingPeer]
    );
    const onSocketUserStopScreenShare = useCallback(
        (userData: PrivateVideoRoomShareScreenData) => {
            const { peerId } = userData;
            removeSharingPeer(peerId);
        },
        [removeSharingPeer]
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
        if (requestIsLoaded(peerResponse) && myPeerId && myStream) {
            for (const userPeer of peerResponse.data.peers) {
                addPeer(userPeer.peerId);
            }
        }
    }, [peerResponse, myPeerId, myStream, addPeer]);
    useEffect(() => {
        if (requestIsLoaded(sharingResponse) && myPeerId) {
            Object.values(sharingResponse.data).forEach((value) => {
                addSharingPeer(value);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myPeerId, sharingResponse, myStream]);
    // Handle socket interactions
    useEffect(() => {
        // Listen to update event
        socket.on(VideoEvent.USER_JOIN_ROOM, onSocketAddPeer);
        socket.on(VideoEvent.USER_LEAVE_ROOM, onSocketRemovePeer);
        socket.on(
            VideoEvent.USER_START_SCREEN_SHARING,
            onSocketUserStartScreenShare
        );
        socket.on(VideoEvent.USER_STOP_STREAMING, onSocketUserStopScreenShare);
        // socket.on(VideoEvent.USER_STOP_STREAMING, onUserStopSharing);
        // socket.on(VideoEvent.USER_START_STREAMING, onUserStartSharing);
        return () => {
            socket.off(VideoEvent.USER_JOIN_ROOM, onSocketAddPeer);
            socket.off(VideoEvent.USER_LEAVE_ROOM, onSocketRemovePeer);
            socket.off(
                VideoEvent.USER_START_SCREEN_SHARING,
                onSocketUserStartScreenShare
            );
            socket.off(
                VideoEvent.USER_STOP_STREAMING,
                onSocketUserStopScreenShare
            );
            // socket.off(VideoEvent.USER_STOP_STREAMING, onUserStopSharing);
            // socket.off(VideoEvent.USER_START_STREAMING, onUserStartSharing);
        };
    }, [
        socket,
        onSocketAddPeer,
        onSocketRemovePeer,
        sessionId,
        myPeerId,
        onSocketUserStartScreenShare,
        onSocketUserStopScreenShare,
    ]);
    // }, [myPeerId, myStream]);
    return {
        peer: myPeer,
        peerId: myPeerId,
        stream: myStream,
        peerCalls,
        peerStreams,
        sharingCalls,
        sharingStreams,
        addPeer,
        removePeer,
        enableStream,
        disableStream,
        cleanUp,
    };
};
