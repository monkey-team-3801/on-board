import React, { useContext } from "react";

import { MyVideo } from "./MyVideo";
import { Container, Row, Col } from "react-bootstrap";
import "./VideoContainer.less";
import { RemotePeerVideo } from "./RemotePeerVideo";
import { PeerContext } from "../peer";

export const FocusedVideoView: React.FunctionComponent<{}> = () => {
    const { peer: myPeer, stream: myStream, peerStreams } = useContext(
        PeerContext
    );

    // Receive calls
    return (
        <Container fluid className="video-container">
            <Row>
                <Col lg={4}>
                    <p>You</p>
                    {myStream ? "Stream exists" : "Stream not exists"}
                    {myStream && myPeer && <MyVideo muted={true} />}
                </Col>
                {peerStreams
                    .keySeq()
                    .toArray()
                    .map((peerId, i) => {
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
