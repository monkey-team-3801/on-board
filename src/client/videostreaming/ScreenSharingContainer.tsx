import React, { useContext, useState } from "react";
import { useScreenSharing } from "../hooks/useScreenSharing";
import { StreamVideo } from "./StreamVideo";
import { Button, Col, Form, Row } from "react-bootstrap";
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
        forceStopScreenSharing,
    } = useScreenSharing(userId, sessionId);
    const [forceStopText, setForceStopText] = useState<string>("");
    const { sharingStreams } = useContext(PeerContext);
    return (
        <>
            <Row>
                {sharingStreams
                    .entrySeq()
                    .toArray()
                    .map(([userId, { stream }]) => (
                        <Col xs="auto" key={userId}>
                            User: {userId}
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
                    <Button onClick={() => stopScreenSharing()}>
                        Stop Sharing
                    </Button>
                </Col>
                <Col xs="auto">
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            forceStopScreenSharing(forceStopText);
                        }}
                    >
                        <Form.Row>
                            <Col xs="auto">
                                <Form.Control
                                    className="mb-2"
                                    value={forceStopText}
                                    onChange={(e) => {
                                        setForceStopText(e.target.value);
                                    }}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button type="submit" className="mb-2">
                                    Send
                                </Button>
                            </Col>
                        </Form.Row>
                    </Form>
                </Col>
            </Row>
        </>
    );
};
