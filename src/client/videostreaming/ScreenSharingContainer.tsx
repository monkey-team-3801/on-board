import React, { useContext } from "react";
import { useScreenSharing } from "../hooks/useScreenSharing";
import { StreamVideo } from "./StreamVideo";
import { Button, Col, Row } from "react-bootstrap";
import { PeerContext } from "../peer";

type Prop = {
    userId: string;
    sessionId: string;
};

export const ScreenSharingContainer: React.FunctionComponent<Prop> = (
    props
) => {
    const { userId, sessionId } = props;
    const {
        setupScreenSharing,
        stopScreenSharing,
    } = useScreenSharing(userId, sessionId);
    const { sharingStreams } = useContext(PeerContext);
    return (
        <>
            <Row>
                {sharingStreams
                    .entrySeq()
                    .toArray()
                    .map(([peerId, stream]) => (
                        <Col xs="auto" key={peerId}>
                            <StreamVideo muted={true} stream={stream} />
                        </Col>
                    ))}
            </Row>
            <Row>
                <Col xs="auto">
                    <Button onClick={async () => await setupScreenSharing()}>
                        Start Sharing
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button onClick={async () => await stopScreenSharing()}>
                        Stop Sharing
                    </Button>
                </Col>
            </Row>
        </>
    );
};
