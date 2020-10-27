import React, { useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { PeerContext } from "../peer";
import { StreamVideo } from "./StreamVideo";

type Props = {};

/**
 * Component handling the sharing of screens.
 */
export const ScreenSharingContainer: React.FunctionComponent<Props> = (
    props
) => {
    const { sharingStreams } = useContext(PeerContext);

    return (
        <Container className="screen-sharing-container d-flex justify-content-center align-items-center">
            <Row>
                {sharingStreams
                    .entrySeq()
                    .toArray()
                    .map(([userId, { stream }]) => (
                        <Col xs="auto" key={userId}>
                            <StreamVideo muted={true} stream={stream} />
                        </Col>
                    ))}
                {sharingStreams.size === 0 && (
                    <p className="text-muted">No active stream</p>
                )}
            </Row>
        </Container>
    );
};
