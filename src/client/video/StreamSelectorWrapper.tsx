import React from "react";
import { Container, Row, Button } from "react-bootstrap";
import { FocusedVideoView } from "./FocusedVideoView";
import { PeerContext } from "../peer";
import { useMyPeer } from "../hooks/useMyPeer";
import { pauseStream, resumeStream } from "../hooks/useMediaStream";

type Props = {
    sessionId: string;
    userId: string;
    socket: SocketIOClient.Socket;
};

export const StreamSelectorWrapper: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { socket, userId, sessionId } = props;
    const peerData = useMyPeer(socket, userId, sessionId);
    const { stream: myStream, peerId: myPeerId, enableStream } = peerData;
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
                            if (!myStream) {
                                enableStream();
                            } else {
                                resumeStream(myStream);
                            }
                        }}
                    >
                        Show Camera
                    </Button>
                    <Button onClick={() => {}}>Show Screen</Button>
                    <Button
                        onClick={() => {
                            if (myStream) {
                                pauseStream(myStream);
                            }
                            // socket.emit(VideoEvent.USER_STOP_STREAMING, myPeerId);
                        }}
                    >
                        Turn off stream
                    </Button>
                </Row>
            </Container>
        </PeerContext.Provider>
    );
};
