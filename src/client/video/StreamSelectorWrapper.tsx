import React, { useContext } from "react";
import { Container, Row, Button } from "react-bootstrap";
import { FocusedVideoView } from "./FocusedVideoView";
import { PeerContext } from "../peer";
import { pauseStream, resumeStream } from "../hooks/useMediaStream";


export const StreamSelectorWrapper: React.FunctionComponent<{}> = () => {
    const { stream: myStream, enableStream } = useContext(PeerContext);
    return (
            <Container>
                <Row>
                    <FocusedVideoView />
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
    );
};
