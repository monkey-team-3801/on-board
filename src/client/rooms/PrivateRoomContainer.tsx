import React from "react";
import { Button, Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { FileUploadType, SessionData, RoomType } from "../../types";
import { DrawingCanvas } from "../canvas";
import { ChatContainer } from "../chat";
import { FileContainer } from "../filehandler/FileContainer";
import { UploadContainer } from "../filehandler/UploadContainer";
import { ResponseTest } from "../responses/ResponseTest";
import { TopLayerContainerProps } from "../types";
import { SessionContainer } from "./containers";

type Props = RouteComponentProps<{ roomId: string }> &
    TopLayerContainerProps & {
        roomType: "private" | "breakout";
    };

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { roomId } = props.match.params;

    return (
        <SessionContainer
            roomType={props.roomType}
            roomId={roomId}
            userId={props.userData.id}
        >
            {(sessionData: SessionData, socket: SocketIOClient.Socket) => {
                return (
                    <>
                        {props.roomType === "breakout" && (
                            <Row>
                                <Button
                                    onClick={() => {
                                        props.history.push(
                                            `/classroom/${sessionData.parentSessionId}`
                                        );
                                    }}
                                >
                                    Main Room
                                </Button>
                            </Row>
                        )}
                        <Row>
                            <Col>
                                <h1>Private Room</h1>
                            </Col>
                            <Col>
                                <ResponseTest
                                    sid={roomId}
                                    userid={props.userData.id}
                                    userType={props.userData.userType}
                                    sock={socket}
                                ></ResponseTest>
                            </Col>
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
                                    roomType={RoomType.PRIVATE}
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
