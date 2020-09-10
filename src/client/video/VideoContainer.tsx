import React, { useCallback, useEffect, useState } from "react";
import Peer from "peerjs";
import { Video } from "./Video";
import { PeerId, useMyPeer } from "../hooks/useMyPeer";
import { VideoEvent } from "../../events";
import { useTransformingSocket } from "../hooks/useTransformingSocket";
import { RouteComponentProps } from "react-router-dom";
type Props = RouteComponentProps<{ roomId: string }> & {};


export const VideoContainer: React.FunctionComponent<Props> = (props) => {
    const sessionId = props.match.params.roomId;
    const [myPeer, myPeerId, myRef] = useMyPeer();
    // TODO: host our own peer server?
    const componentDidMount = useCallback((socket: SocketIOClient.Socket) => {
        if (!myPeerId) {
            return socket;
        }
        return socket.emit(VideoEvent.USER_JOIN_ROOM, {
            sessionId,
            userId: myPeerId
        });
    }, [sessionId, myPeerId]);
    const transformData = React.useCallback(
        (peers: Array<PeerId> | undefined, newPeers: Array<PeerId>) => {
            if (peers !== undefined) {
                return [...peers, ...newPeers];
            } else {
                return newPeers;
            }
        },
        []
    );

    const { data: peerIds, setData: setPeerIds, socket } = useTransformingSocket<Array<PeerId>, Array<PeerId>>(
        VideoEvent.UPDATE_USERS,
        componentDidMount,
        transformData,
        new Array<PeerId>()
    );

    // socket.on("disconnect", (reason: string) => {
    //     if (reason === "io client disconnect") {
    //         socket.emit(VideoEvent.USER_LEAVE_ROOM, { sessionId, userId: myPeerId });
    //     }
    // });
    useEffect( () => {
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            // ev.returnValue = "";
            socket.emit(VideoEvent.USER_LEAVE_ROOM, { sessionId, userId: myPeerId });
            return null;
        });
    });
    return <Video videoRef={myRef} mine={true} />;
};
