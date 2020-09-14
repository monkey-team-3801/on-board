import React, { useCallback, useEffect, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { Video } from "./Video";
import { PeerId, useMyPeer } from "../hooks/useMyPeer";
import { VideoEvent } from "../../events";
import { RouteComponentProps } from "react-router-dom";
import omit from "lodash/omit";
import keys from "lodash/keys";
import difference from "lodash/difference";
import { useMediaStream } from "../hooks/useMediaStream";
import { socket } from "../io";

type Props = RouteComponentProps<{ roomId: string }> & {};
type PeerCalls = {
    [key: string]: MediaConnection;
};
type PeerStreams = {
    [key: string]: MediaStream;
};

export const VideoContainer: React.FunctionComponent<Props> = (props) => {
    const sessionId = props.match.params.roomId;
    const [myPeer, myPeerId, myStream] = useMyPeer();
    const [peerCalls, setPeerCalls] = useState<PeerCalls>({});
    const [peerStreams, setPeerStreams] = useState<PeerStreams>({});

    const addPeer = useCallback(
        (peerId: PeerId) => {
            if (myStream) {
                console.log(peerId, myStream, myPeer.id);
                const call = myPeer.call(peerId, myStream);
                if (!call) {
                    console.log("Call is undefined");
                    return;
                }
                console.log("Call is defined.");
                call.on("stream", (stream) => {
                    console.log("Receiving stream from", peerId);
                    setPeerStreams((prev) => ({ ...prev, [peerId]: stream }));
                });
                call.on("close", () => {
                    setPeerStreams((prev) => omit(prev, peerId));
                });
                setPeerCalls({ ...peerCalls, [peerId]: call });
            }
        },
        [myStream, peerCalls, myPeer]
    );
    const removePeer = useCallback(
        (peerId: PeerId) => {
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
        myPeer.on("call", (call: MediaConnection) => {
            call.answer(myStream);
            setPeerCalls((prev) => ({ ...prev, [call.peer]: call }));
            call.on("stream", (stream) => {
                setPeerStreams((prev) => ({ ...prev, [call.peer]: stream }));
            });
        });
    }, [myPeer, myStream]);

    // Handle socket interactions
    useEffect(() => {
        if (myPeerId === "") {
            return;
        }
        socket
            .connect()
            .emit(VideoEvent.USER_JOIN_ROOM, { sessionId, userId: myPeerId });
        // Listen to update event
        socket.on(VideoEvent.UPDATE_USERS, (updatedPeers: Array<PeerId>) => {
            const currentPeers = keys(peerCalls);
            const removedPeers = difference(currentPeers, updatedPeers);
            const addedPeers = difference(updatedPeers, currentPeers);
            for (const addedPeer of addedPeers) {
                addPeer(addedPeer);
            }
            for (const removedPeer of removedPeers) {
                removePeer(removedPeer);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [sessionId, myPeerId, peerCalls, addPeer, removePeer]);

    // Receive calls

    return <Video videoStream={myStream} mine={true} />;
};
