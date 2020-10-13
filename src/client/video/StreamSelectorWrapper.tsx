import React from "react";
import { Container, Row, Button } from "react-bootstrap";
import { FocusedVideoView } from "./FocusedVideoView";
import { PeerContext } from "../peer";
import { useMyPeer } from "../hooks/useMyPeer";
import { VideoEvent } from "../../events";

type Props = { sessionId: string; userId: string; socket: SocketIOClient.Socket };

export const StreamSelectorWrapper: React.FunctionComponent<Props> = (
    props: Props
) => {
    const {socket} = props;
    const peerData = useMyPeer();
    const { enableStream, disableStream, peerId: myPeerId } = peerData;
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
                            socket.emit(VideoEvent.USER_STOP_STREAMING, myPeerId);
                        }}
                    >
                        Turn off stream
                    </Button>
                </Row>
            </Container>
        </PeerContext.Provider>
    );
};
