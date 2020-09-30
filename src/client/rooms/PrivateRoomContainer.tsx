import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { RoomEvent } from "../../events";
import { FileUploadType, SessionData } from "../../types";
import { DrawingCanvas } from "../canvas";
import { ChatContainer } from "../chat";
import { FileContainer } from "../filehandler/FileContainer";
import { UploadContainer } from "../filehandler/UploadContainer";
import { useFetch } from "../hooks";
import { socket } from "../io";
import { TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import { SessionContainer } from "./containers";

type Props = RouteComponentProps<{ roomId: string }> &
    TopLayerContainerProps & {
        roomType: "private" | "breakout";
    };

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { roomId } = props.match.params;

    console.log(props);

    return (
        <SessionContainer
            roomType={props.roomType}
            roomId={roomId}
            userId={props.userData.id}
        >
            {(sessionData: SessionData, socket: SocketIOClient.Socket) => {
                return (
                    <>
                        <Row>
                            <h1>Private Room</h1>
                        </Row>
                        <Row>
                            <DrawingCanvas
                                sessionId={sessionData.id}
                                socket={socket}
                            />
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
                                    initialChatLog={sessionData.messages}
                                />
                            </Col>
                            <Col>
                                <Row>
                                    <FileContainer
                                        sessionID={roomId}
                                    ></FileContainer>
                                </Row>
                                <Row>
                                    <UploadContainer
                                        uploadType={FileUploadType.DOCUMENTS}
                                        sessionID={roomId}
                                    ></UploadContainer>
                                </Row>
                            </Col>
                        </Row>
                    </>
                );
            }}
        </SessionContainer>
    );
};
