import React, { useCallback, useContext, useEffect, useState } from "react";

import { MyVideo } from "./MyVideo";
import { VideoEvent } from "../../events";
import { Container, Row, Col } from "react-bootstrap";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import "./VideoContainer.less";
import { VideoPeersResponseType, UserPeer } from "../../types";
import { RemotePeerVideo } from "./RemotePeerVideo";
import { PeerId } from "../hooks/useMyPeer";
import { PeerContext } from "../peer";

type Props = {
    sessionId: string;
    userId: string;
    socket: SocketIOClient.Socket;
};

export const FocusedVideoView: React.FunctionComponent<Props> = (props) => {
    const { sessionId, userId, socket } = props;
    const [peerIds, setPeerIds] = useState<Array<PeerId>>([]);
    const {
        peer: myPeer,
        peerId: myPeerId,
        cleanUp: cleanUpPeer,
        stream: myStream,
        peerStreams,
    } = useContext(PeerContext);
    const [response] = useFetch<
        VideoPeersResponseType,
        { sessionId: string; userId: string }
    >("/videos/peers", { sessionId, userId });
    // console.log("my peer id", myPeerId);
    useEffect(() => {
        if (requestIsLoaded(response)) {
            setPeerIds(
                response.data.peers
                    .map((usePeer) => usePeer.peerId)
                    .filter((peerId) => peerId !== myPeerId)
            );
        }
    }, [response, myPeerId]);
    useEffect(() => {
        if (myPeerId) {
            socket.connect();

        }
        return () => {
            // socket.emit(VideoEvent.USER_LEAVE_ROOM, {
            //     sessionId,
            //     userId,
            //     peerId: myPeerId,
            // });
        };
    }, [socket, myPeerId, sessionId, userId]);

    useEffect(() => {
        return () => {
            console.log("cleanup");
            //cleanUpPeer();
            //disableMyPeer();
        };
    }, []);

    // Receive calls
    return (
        <Container fluid className="video-container">
            <Row>
                <Col lg={4}>
                    <p>You</p>
                    {myStream ? "Stream exists" : "Stream not exists"}
                    {myStream && myPeer && (
                        <MyVideo videoStream={myStream} muted={true} />
                    )}
                </Col>
                {peerIds.map((peerId, i) => {
                    return (
                        <Col lg={4} key={i}>
                            <p>{peerId}</p>
                            <RemotePeerVideo peerId={peerId} />
                        </Col>
                    );
                })}
            </Row>
        </Container>
    );
};
