import React, { useCallback, useContext, useEffect, useState } from "react";

import { Video } from "./Video";
import { VideoEvent } from "../../events";
import { socket } from "../io";
import { Container, Row, Col } from "react-bootstrap";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import "./VideoContainer.less";
import { VideoPeersResponseType, UserPeer } from "../../types";
import { RemotePeerVideo } from "./RemotePeerVideo";
import { PeerId } from "../hooks/useMyPeer";
import { PeerContext } from "../peer";

type Props = { sessionId: string; userId: string };

export const FocusedVideoView: React.FunctionComponent<Props> = (props) => {
    const { sessionId, userId } = props;
    const [peerIds, setPeerIds] = useState<Array<PeerId>>([]);
    const {peer: myPeer, peerId: myPeerId, cleanUp: cleanUpPeer, stream: myStream} = useContext(PeerContext);
    const [response] = useFetch<
        VideoPeersResponseType,
        { sessionId: string; userId: string }
        >("/videos/peers", { sessionId, userId });
    useEffect(() => {
        if (requestIsLoaded(response)) {
            setPeerIds(response.data.peers.map(usePeer => usePeer.peerId).filter(peerId => peerId !== myPeerId));
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
            //cleanUpPeer();
            socket.disconnect();
            //disableMyPeer();
        };
    }, []);

    const onSocketUpdateUsers = useCallback(async (userPeer: UserPeer) => {
        console.log("new peer", userPeer.peerId);
        setPeerIds(prev => [...prev, userPeer.peerId]);
    }, []);

    const onSocketRemoveUser = useCallback((userPeer: UserPeer) => {
        setPeerIds(prev => prev.filter(peerId => peerId !== userPeer.peerId));
    }, []);

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
                        />
                    )}
                </Col>
                {peerIds.map(
                    (peerId, i) => {
                        return (
                            <Col lg={4} key={i}>
                                <p>{peerId}</p>
                                <RemotePeerVideo peerId={peerId}/>
                            </Col>
                        );
                    }
                )}
            </Row>
        </Container>
    );
};
