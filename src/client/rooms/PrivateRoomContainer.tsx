import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col } from "react-bootstrap";

import { useFetch, useSocket } from "../hooks";
import { ChatContainer } from "../chat";
import { requestIsLoaded } from "../utils";
import { FileUploadType, SessionData } from "../../types";
import { TopLayerContainerProps } from "../types";
import { FileContainer } from "../filehandler/FileContainer";
import { UploadContainer } from "../filehandler/UploadContainer";
import { DrawingCanvas } from "../canvas";
import { RoomEvent } from "../../events";
import { socket } from "../io";

type Props = RouteComponentProps<{ roomId: string }> &
    TopLayerContainerProps & {};

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { roomId } = props.match.params;
    const [sessionResponse] = useFetch<SessionData, { id: string }>(
        "/session/getPrivateSession",
        {
            id: roomId,
        }
    );

    React.useEffect(() => {
        socket.emit(RoomEvent.PRIVATE_ROOM_JOIN, {
            sessionId: roomId,
        });
    }, [roomId]);

    if (!requestIsLoaded(sessionResponse)) {
        return <div>Loading</div>;
    }

    return (
        <Container>
            <Row>
                <h1>Private Room</h1>
            </Row>
            <Row>
                <DrawingCanvas sessionId={sessionResponse.data.id} />
            </Row>
            <Row>
                <Col>
                    <p>Room ID: {roomId}</p>
                </Col>
                <Col>
                    <Button
                        size="sm"
                        variant="light"
                        onClick={() => {
                            props.history.push("/home");
                        }}
                    >
                        Back
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ChatContainer
                        roomId={roomId}
                        username={props.userData.username}
                        initialChatLog={sessionResponse.data.messages}
                    />
                </Col>
                <Col>
                    <Row>
                        <FileContainer sessionID={roomId}></FileContainer>
                    </Row>
                    <Row>
                        <UploadContainer
                            uploadType={FileUploadType.DOCUMENTS}
                            sessionID={roomId}
                        ></UploadContainer>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};
