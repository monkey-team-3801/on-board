import React from "react";
import { Container, Row, Button } from "react-bootstrap";
import { VideoContainer } from "./VideoContainer";
import { useMediaStream } from "../hooks/useMediaStream";

type Props = { sessionId: string; userId: string };

export const StreamSelectorWrapper: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [myStream, setMediaStream] = useMediaStream();

    return (
        <Container>
            <Row>
                <VideoContainer {...props} myStream={myStream} />
            </Row>
            <Row>
                <Button
                    onClick={() => {
                        setMediaStream("camera");
                    }}
                >
                    Show Camera
                </Button>
                <Button
                    onClick={() => {
                        setMediaStream("display");
                    }}
                >
                    Show Screen
                </Button>
                <Button
                    onClick={() => {
                        setMediaStream("none");
                    }}
                >
                    Turn off stream
                </Button>
            </Row>
        </Container>
    );
};
