import React, { useContext } from "react";
import { Container, Row, Button } from "react-bootstrap";
import { FocusedVideoView } from "./FocusedVideoView";
import { PeerContext } from "../peer";
import {
    turnAudioOff,
    turnAudioOn,
    turnVideoOff,
    turnVideoOn,
} from "../hooks/useMediaStream";

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
                            turnAudioOn(myStream);
                        }
                    }}
                >
                    Unmute
                </Button>
                <Button
                    onClick={() => {
                        if (myStream) {
                            turnAudioOff(myStream);
                        }
                        // socket.emit(VideoEvent.USER_STOP_STREAMING, myPeerId);
                    }}
                >
                    Mute
                </Button>
                <Button
                    onClick={() => {
                        if (!myStream) {
                            enableStream();
                        } else {
                            turnVideoOn(myStream);
                        }
                    }}
                >
                    Show Camera
                </Button>
                <Button
                    onClick={() => {
                        if (myStream) {
                            turnVideoOff(myStream);
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
