import React from "react";
import { Container, Row, Button } from "react-bootstrap";
import { VideoContainer } from "./VideoContainer";
import { useMediaStream } from "../hooks/useMediaStream";

type Props = { sessionId: string; userId: string };

export const StreamSelectorWrapper: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [myStream, enableMediaStream, disableMediaStream] = useMediaStream();

    return (
        <Container>
            <Row>
                <VideoContainer
                    {...props}
                    myStream={myStream}
                    // Hack to force component rerender
                    //key={new Date().toString()}
                />
            </Row>
            <Row>
                <Button
                    onClick={() => {
                        enableMediaStream();
                    }}
                >
                    Show Camera
                </Button>
                <Button
                    onClick={() => {

                    }}
                >
                    Show Screen
                </Button>
                <Button
                    onClick={() => {
                        disableMediaStream();
                    }}
                >
                    Turn off stream
                </Button>
            </Row>
        </Container>
    );
};
