import React, { useCallback, useEffect, useState } from "react";
import { MediaConnection } from "peerjs";
import { Map } from "immutable";

import { Video } from "./Video";
import { useMyPeer } from "../hooks/useMyPeer";
import { VideoEvent } from "../../events";
import { socket } from "../io";
import { Container, Row, Col } from "react-bootstrap";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import "./VideoContainer.less";
import { VideoPeersResponseType, UserPeer } from "../../types";

type Props = { sessionId: string; userId: string; myStream?: MediaStream };
type PeerCalls = {
    [key: string]: MediaConnection;
};
type PeerStreams = {
    [key: string]: MediaStream;
};
type VideoStreamData = {
    userId: string;
    stream: MediaStream;
};

export const FocusedVideoView: React.FunctionComponent<Props> = (props) => {
    const { sessionId, userId, myStream } = props;
    const [myPeer, myPeerId] = useMyPeer();
    const [remotePeerIds, setRemotePeers] = useState([]);
    const [peerCalls, setPeerCalls] = useState<Map<string, MediaConnection>>(
        Map()
    );
    const [peerStreams, setPeerStreams] = useState<Map<string, MediaStream>>(
        Map()
    );
    // const [myStream, setMediaStream] = useMediaStream();

    const [response] = useFetch<
        VideoPeersResponseType,
        { sessionId: string; userId: string }
    >("/videos/peers", { sessionId, userId });
    // myStream?.getTracks().forEach(track => {
    //     console.log(track, track.getCapabilities());
    // });
    myStream?.getVideoTracks().forEach(track => {
        console.log("video track settings:", track.getSettings());
    });
    const addPeer = useCallback(
        (userPeer: UserPeer) => {
            const { userId: theirUserId, peerId } = userPeer;
            if (myPeer) {
                if (myStream) {
                    console.log("My stream:", myStream);
                    //console.log(peerId, myStream, myPeer.id, myPeerId);
                    console.log("Trying to call", peerId);
                    const call = myPeer.call(peerId, myStream);
                    if (!call) {
                        console.log("Call is undefined");
                        return;
                    }
                    console.log("Connecting to Peer", peerId);
                    call.on("stream", (stream) => {
                        console.log("MY CALL Receiving stream from", peerId);
                        setPeerStreams((prev) => {
                            return prev.set(peerId, stream);
                        });
                    });
                    call.on("close", () => {
                        console.log("disconnecting from", peerId);
                        setPeerStreams((prev) => {
                            return prev.delete(peerId);
                        });
                        setPeerCalls((prev) => {
                            return prev.delete(peerId);
                        });
                    });
                    call.on("error", (error) => {
                        console.log("Call error", error);
                        setPeerStreams((prev) => {
                            return prev.delete(peerId);
                        });
                        setPeerCalls((prev) => {
                            return prev.delete(peerId);
                        });
                    });
                }
                myPeer.on("call", (call: MediaConnection) => {
                    console.log("Receiving call from", call.peer);
                    call.answer(myStream);
                    setPeerCalls((prev) => {
                        return prev.set(call.peer, call);
                    });
                    call.on("stream", (stream) => {
                        console.log(
                            "OTHER CALL Receiving stream from",
                            call.peer
                        );
                        setPeerStreams((prev) => {
                            return prev.set(call.peer, stream);
                        });
                    });
                });
            }
        },
        [myStream, myPeer, peerStreams]
    );
    const removePeer = useCallback((userPeer: UserPeer) => {
        const { userId: theirUserId, peerId } = userPeer;
        console.log("Removing peer", peerId);
        setPeerStreams((prev) => {
            return prev.delete(peerId);
        });
        setPeerCalls((prev) => {
            const call = prev.get(theirUserId);
            call?.close();
            console.log("Peer", peerId, "hung up.");
            return prev.delete(theirUserId);
        });
    }, []);

    useEffect(() => {
        if (requestIsLoaded(response)) {
            response.data.peers.forEach((userPeer) => {
                if (userPeer.peerId !== myPeerId) {
                    addPeer(userPeer);
                }
            });
        }
    }, [response, myPeerId]);

    useEffect(() => {
        if (myPeerId) {
            socket.connect();
            socket.emit(VideoEvent.USER_JOIN_ROOM, {
                sessionId,
                userId,
                peerId: myPeerId,
            });
        }
        return () => {
            // socket.emit(VideoEvent.USER_LEAVE_ROOM, {
            //     sessionId,
            //     userId,
            //     peerId: myPeerId,
            // });
        };
    }, [myPeerId, sessionId, userId]);

    useEffect(() => {
        return () => {
            console.log("cleanup");
            socket.disconnect();
        };
    }, []);

    const onSocketUpdateUsers = useCallback(
        (userPeer: UserPeer) => {
            console.log("new peer", userPeer.peerId);
            addPeer(userPeer);
        },
        [addPeer]
    );

    const onSocketRemoveUser = useCallback(
        (userPeer: UserPeer) => {
            removePeer(userPeer);
        },
        [removePeer]
    );

    // Handle socket interactions
    useEffect(() => {
        // Listen to update event
        socket.on(VideoEvent.USER_JOIN_ROOM, onSocketUpdateUsers);
        socket.on(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);

        // console.log("Use effect running, emitting join room");
        // socket.emit(VideoEvent.USER_JOIN_ROOM, { sessionId, userId: myPeerId });
        return () => {
            socket.off(VideoEvent.USER_JOIN_ROOM, onSocketUpdateUsers);
            socket.off(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
        };
    }, [onSocketUpdateUsers, onSocketRemoveUser]);

    // Receive calls
    return (
        <Container fluid className="video-container">
            <Row>
                <Col lg={4}>
                    <p>You</p>
                    {myStream ? "Stream exists" : "Stream not exists"}
                    {myStream && myPeer && (
                        <Video
                            videoStream={myStream}
                            mine={true}
                            muted={true}
                            peerId={myPeerId}
                        />
                    )}
                </Col>
                {Array.from(peerStreams.entries()).map(
                    ([peerId, stream], i) => {
                        return (
                            <Col lg={4} key={i}>
                                <p>{peerId}</p>
                                <Video
                                    videoStream={stream}
                                    mine={false}
                                    muted={true}
                                    peerId={peerId}
                                />
                            </Col>
                        );
                    }
                )}
            </Row>
        </Container>
    );
};
