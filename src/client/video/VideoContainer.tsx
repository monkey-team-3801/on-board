import React, { useCallback, useEffect, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { Video } from "./Video";
import { PeerId, useMyPeer } from "../hooks/useMyPeer";
import { VideoEvent } from "../../events";
import { RouteComponentProps } from "react-router-dom";
import omit from "lodash/omit";
import { useNewSocket } from "../hooks/useNewSocket";
import { useMediaStream } from "../hooks/useMediaStream";

type Props = RouteComponentProps<{ roomId: string }> & {};
type PeerCalls = {
    [key: string]: MediaConnection;
};
type PeerStreams = {
    [key: string]: MediaStream;
};

export const VideoContainer: React.FunctionComponent<Props> = (props) => {
    const sessionId = props.match.params.roomId;
    const [myPeer, myPeerId, myRef] = useMyPeer();
    const [peerCalls, setPeerCalls] = useState<PeerCalls>({});
    const [peerStreams, setPeerStreams] = useState<PeerStreams>({});
    const [socket] = useNewSocket();
    const [myStream] = useMediaStream();

    const addPeer = useCallback(
        (peerId: PeerId) => {
            if (myStream) {
                const call = myPeer.call(peerId, myStream);
                call.on("stream", (stream) => {
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
            }
        },
        [peerCalls]
    );
    // Emit User join room event
    useEffect(() => {
        console.log("Current peer id", myPeerId);
        socket.emit(VideoEvent.USER_JOIN_ROOM, { sessionId, userId: myPeerId });
        // clean up
        return () => {
            socket.disconnect();
        };
    }, [socket, sessionId, myPeerId]);

    // Listen to update event
    socket.on(VideoEvent.UPDATE_USERS, (peers: Array<PeerId>) => {

    });
    // Receive calls


    return <Video videoRef={myRef} mine={true} />;
};
