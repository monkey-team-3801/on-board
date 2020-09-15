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
import { log } from "util";

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
            console.log("Adding Peer", peerId);
            if (myStream) {
                //console.log(peerId, myStream, myPeer.id, myPeerId);
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
        // Listen to update event
        socket.on(VideoEvent.UPDATE_USERS, (updatedPeers: Array<PeerId>) => {
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
        });
        console.log("Use effect running");
        socket.emit(VideoEvent.USER_JOIN_ROOM, { sessionId, userId: myPeerId });

        return () => {
            //socket.disconnect();
        };
    }, [myPeerId]);

    // Receive calls

    return (
        <div>
            <Video videoStream={myStream} mine={true} />
            {keys(peerStreams).map((peerId, index) => (
                <Video
                    key={index}
                    videoStream={peerStreams[peerId]}
                    mine={false}
                />
            ))}
        </div>
    );
};
