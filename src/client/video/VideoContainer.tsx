import React, { useCallback, useEffect, useState } from "react";
import { MediaConnection } from "peerjs";
import { Video } from "./Video";
import { PeerId, useMyPeer } from "../hooks/useMyPeer";
import { VideoEvent } from "../../events";
import { RouteComponentProps } from "react-router-dom";
import omit from "lodash/omit";
import keys from "lodash/keys";
import difference from "lodash/difference";
import { socket } from "../io";
import { useMediaStream } from "../hooks/useMediaStream";
import { Button } from "react-bootstrap";

type Props = { sessionId: string };
type PeerCalls = {
    [key: string]: MediaConnection;
};
type PeerStreams = {
    [key: string]: MediaStream;
};

export const VideoContainer: React.FunctionComponent<Props> = (props) => {
    const { sessionId } = props;
    const [myPeer, myPeerId, setupPeer] = useMyPeer();
    const [peerCalls, setPeerCalls] = useState<PeerCalls>({});
    const [peerStreams, setPeerStreams] = useState<PeerStreams>({});
    const [myStream, getMediaStream, clearMediaStream] = useMediaStream();
    const addPeer = useCallback(
        (peerId: PeerId) => {
            console.log("Adding Peer", peerId);
            console.log("My stream:", myStream);
            if (myStream && myPeer) {
                //console.log(peerId, myStream, myPeer.id, myPeerId);
                console.log("Trying to call", peerId);
                const call = myPeer.call(peerId, myStream);
                if (!call) {
                    console.log("Call is undefined");
                    return;
                }
                console.log("Connecting to Peer", peerId);
                call.on("stream", (stream) => {
                    console.log("Receiving stream from", peerId);
                    setPeerStreams((prev) => ({ ...prev, [peerId]: stream }));
                });
                call.on("close", () => {
                    console.log("disconnecting from", peerId);
                    setPeerStreams((prev) => omit(prev, peerId));
                    setPeerCalls((prev) => omit(prev, peerId));
                });
                call.on("error", (error) => {
                    console.log("Call error", error);
                    setPeerStreams((prev) => omit(prev, peerId));
                    setPeerCalls((prev) => omit(prev, peerId));
                });
                setPeerCalls({ ...peerCalls, [peerId]: call });
            }
        },

        [myStream, peerCalls, myPeer]
    );
    const removePeer = useCallback(
        (peerId: PeerId) => {
            console.log("Removing peer", peerId);
            setPeerStreams((prev) => omit(prev, peerId));
            const call = peerCalls[peerId];
            if (call) {
                setPeerCalls((prev) => omit(prev, peerId));
                call.close();
                console.log("Peer", peerId, "hung up.");
            }
        },
        [peerCalls]
    );

    // Listen to calls
    useEffect(() => {
        console.log(myStream, myPeer);
        if (myPeer && myPeerId) {
            console.log("My stream exists");
            socket.emit(VideoEvent.USER_JOIN_ROOM, {
                sessionId,
                userId: myPeerId,
            });
            myPeer.on("call", (call: MediaConnection) => {
                console.log("Receiving call from", call.peer);
                call.answer(myStream);
                // if (myStream) {

                // }
                setPeerCalls((prev) => ({ ...prev, [call.peer]: call }));
                call.on("stream", (stream) => {
                    console.log("Receiving stream from", call.peer);
                    setPeerStreams((prev) => ({
                        ...prev,
                        [call.peer]: stream,
                    }));
                });
            });
        } else {
            if (myPeerId) {
                console.log("disconnected");
                socket.emit(VideoEvent.USER_LEAVE_ROOM, {
                    sessionId,
                    userId: myPeerId,
                });
            }
        }
    }, [myStream, myPeer, myPeerId]);

    const onSocketUpdateUsers = useCallback(
        (updatedPeers: Array<PeerId>) => {
            console.log("updating users", updatedPeers);
            const currentPeers = keys(peerCalls);
            const removedPeers = difference(currentPeers, updatedPeers);
            const addedPeers = difference(updatedPeers, currentPeers);
            for (const addedPeer of addedPeers) {
                if (addedPeer === myPeerId) {
                    continue;
                }
                addPeer(addedPeer);
            }
            for (const removedPeer of removedPeers) {
                removePeer(removedPeer);
            }
            console.log(peerStreams);
        },
        [addPeer, myPeerId, peerCalls, peerStreams, removePeer]
    );

    const onSocketRemoveUser = useCallback(
        (removedPeerId: string) => {
            if (removedPeerId !== myPeerId) {
                console.log("removing");
                removePeer(removedPeerId);
            }
        },
        [myPeerId, removePeer]
    );

    // Handle socket interactions
    useEffect(() => {
        // Listen to update event
        socket.on(VideoEvent.UPDATE_USERS, onSocketUpdateUsers);
        socket.on(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
        // console.log("Use effect running, emitting join room");
        // socket.emit(VideoEvent.USER_JOIN_ROOM, { sessionId, userId: myPeerId });
        return () => {
            socket.off(VideoEvent.UPDATE_USERS, onSocketUpdateUsers);
            socket.off(VideoEvent.USER_LEAVE_ROOM, onSocketRemoveUser);
        };
    }, [onSocketUpdateUsers, onSocketRemoveUser]);

    // Receive calls

    return (
        <div>
            {myStream && myPeer && (
                <Video videoStream={myStream} mine={true} muted={true} />
            )}
            {keys(peerStreams).map((peerId, index) => (
                <Video
                    key={index}
                    videoStream={peerStreams[peerId]}
                    mine={false}
                    muted={true}
                />
            ))}
            <Button
                onClick={() => {
                    if (!myPeer) {
                        setupPeer();
                    }
                }}
            >
                Connect
            </Button>
            <Button
                onClick={() => {
                    if (!myStream) {
                        getMediaStream();
                    }
                }}
            >
                Enable webcam
            </Button>
            <Button
                onClick={() => {
                    clearMediaStream();
                }}
            >
                Disconnect
            </Button>
        </div>
    );
};
