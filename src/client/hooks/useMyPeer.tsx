import { Map } from "immutable";
import Peer, { MediaConnection } from "peerjs";
import { useCallback, useEffect, useState } from "react";
import {
    PrivateVideoRoomForceStopSharingData,
    PrivateVideoRoomShareScreenData,
    PrivateVideoRoomStopSharingData,
    VideoEvent,
} from "../../events";
import { UserPeer, VideoPeersResponseType } from "../../types";
import { PeerData } from "../peer";
import { peerOptions } from "../peer/peer";
import { requestIsLoaded } from "../utils";
import { useFetch } from "./useFetch";
import { useMediaStream } from "./useMediaStream";

declare var process: any;

export type PeerId = string;
export type Peers = Map<PeerId, Peer.MediaConnection>;

/**
 * Custom hook for handling peer connections and setup.
 * @param socket Current session socket.
 * @param userId Current user id.
 * @param sessionId Current session id the hook us used in.
 */
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
        Map<
            string,
            {
                peerId: string;
                stream: MediaStream;
            }
        >
    >(Map());
    const [sharingCalls, setSharingCalls] = useState<
        Map<
            string,
            {
                peerId: string;
                call: MediaConnection;
            }
        >
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
            console.log("emitting");
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

    const [userIdToPeerIdMap, setUserIdToPeerIdMap] = useState<
        Map<string, string>
    >(Map());

    const addPeer = useCallback<(peerId: PeerId, theirUserId?: string) => void>(
        async (peerId, theirUserId) => {
            if (theirUserId) {
                setUserIdToPeerIdMap((mapping) => {
                    return mapping.set(theirUserId, peerId);
                });
            }
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
    const removePeer = useCallback<
        (peerId: PeerId, theirUserId?: string) => void
    >(
        (peerId, theirUserId) => {
            setPeerStreams((prev) => prev.delete(peerId));
            const remoteCall = peerCalls.get(peerId);
            remoteCall?.close();
            setPeerCalls((prev) => prev.delete(peerId));
            if (theirUserId) {
                setUserIdToPeerIdMap((mapping) => {
                    return mapping.delete(theirUserId);
                });
            }
        },
        [peerCalls]
    );

    const addSharingPeer = useCallback<
        (userData: PrivateVideoRoomShareScreenData) => void
    >(
        async (userData) => {
            const { userId, peerId } = userData;
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
            setSharingCalls(
                sharingCalls.set(userId, {
                    peerId,
                    call,
                })
            );
            call.on("stream", (stream) => {
                setSharingStreams(
                    sharingStreams.set(userId, { peerId, stream })
                );
            });
            call.on("close", () => {
                setSharingCalls(sharingCalls.delete(userId));
                setSharingStreams(sharingStreams.delete(userId));
            });
            call.on("error", (error) => {
                console.log("streaming peer call error", error);
                setSharingStreams(sharingStreams.delete(userId));
                setSharingCalls(sharingCalls.delete(userId));
            });
        },
        [enableStream, myPeer, sharingCalls, sharingStreams, myPeerId, myStream]
    );

    const removeSharingPeer = useCallback<(sharingUserId: string) => void>(
        (sharingUserId) => {
            const callEntry = sharingCalls.get(sharingUserId);
            if (callEntry) {
                callEntry.call.close();
            }
            setSharingCalls(sharingCalls.delete(sharingUserId));
            setSharingStreams(sharingStreams.delete(sharingUserId));
        },
        [sharingCalls, sharingStreams]
    );

    const onSocketAddPeer = useCallback(
        async (userPeer: UserPeer) => {
            addPeer(userPeer.peerId, userPeer.userId);
        },
        [addPeer]
    );

    const onSocketRemovePeer = useCallback(
        (userPeer: UserPeer) => {
            removePeer(userPeer.peerId, userPeer.userId);
        },
        [removePeer]
    );

    const onSocketUserStartScreenShare = useCallback(
        (userData: PrivateVideoRoomShareScreenData) => {
            addSharingPeer(userData);
        },
        [addSharingPeer]
    );
    const onSocketUserStopScreenShare = useCallback(
        (userData: PrivateVideoRoomStopSharingData) => {
            removeSharingPeer(userData.userId);
        },
        [removeSharingPeer]
    );
    const onSocketUserForceStopScreenShare = useCallback(
        (userData: PrivateVideoRoomForceStopSharingData) => {
            removeSharingPeer(userData.targetId);
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
                addPeer(userPeer.peerId, userPeer.userId);
            }
        }
    }, [peerResponse, myPeerId, myStream, addPeer]);
    useEffect(() => {
        if (requestIsLoaded(sharingResponse) && myPeerId) {
            Object.entries(sharingResponse.data).forEach(([userId, peerId]) => {
                addSharingPeer({ userId, peerId, sessionId });
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
        socket.on(
            VideoEvent.FORCE_STOP_SCREEN_SHARING,
            onSocketUserForceStopScreenShare
        );
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
            socket.off(
                VideoEvent.FORCE_STOP_SCREEN_SHARING,
                onSocketUserForceStopScreenShare
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
        onSocketUserForceStopScreenShare,
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
        userIdToPeerIdMap,
        addPeer,
        removePeer,
        enableStream,
        disableStream,
        cleanUp,
    };
};
