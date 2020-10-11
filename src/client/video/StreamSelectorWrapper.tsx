import React from "react";
import { Container, Row, Button } from "react-bootstrap";
import { FocusedVideoView } from "./FocusedVideoView";
import { PeerContext } from "../peer";
import { useMyPeer } from "../hooks/useMyPeer";

type Props = { sessionId: string; userId: string };

export const StreamSelectorWrapper: React.FunctionComponent<Props> = (
    props: Props
) => {
    const peerData = useMyPeer();
    const { enableStream, disableStream } = peerData;
    return (
        <PeerContext.Provider value={peerData}>
            <Container>
                <Row>
                    <FocusedVideoView
                        {...props}
                        // Hack to force component rerender
                        //key={new Date().toString()}
                    />
                </Row>
                <Row>
                    <Button
                        onClick={() => {
                            enableStream();
                        }}
                    >
                        Show Camera
                    </Button>
                    <Button onClick={() => {}}>Show Screen</Button>
                    <Button
                        onClick={() => {
                            disableStream();
                        }}
                    >
                        Turn off stream
                    </Button>
                </Row>
            </Container>
        </PeerContext.Provider>
    );
};
