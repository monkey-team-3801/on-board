import React from "react";
import { Button, Col, Row, Container } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import {
    FileUploadType,
    SessionData,
    RoomType,
    UserDataResponseType,
} from "../../types";
import { DrawingCanvas } from "../canvas";
import { ChatContainer } from "../chat";
import { FileContainer } from "../filehandler/FileContainer";
import { UploadContainer } from "../filehandler/UploadContainer";
import { ResponsesModal } from "../responses";
import { TopLayerContainerProps } from "../types";
import { SessionContainer, SidePanelContainer } from "./containers";

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
            {(
                sessionData: SessionData,
                users: Array<Omit<UserDataResponseType, "courses">> | undefined,
                socket: SocketIOClient.Socket
            ) => {
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
                        <Container fluid className="private-room-container">
                            <Row>
                                <Col md={9}>
                                    <header className="d-flex">
                                        <Container fluid>
                                            <h1>{`${sessionData.name}`}</h1>
                                            <p>{sessionData.description}</p>
                                        </Container>
                                    </header>
                                    <Container fluid>
                                        <Row>
                                            <DrawingCanvas
                                                sessionId={sessionData.id}
                                                socket={socket}
                                            />
                                        </Row>
                                        <Container>
                                            <Row>
                                                <Row>
                                                    <FileContainer
                                                        sessionID={roomId}
                                                    ></FileContainer>
                                                </Row>
                                                <Row>
                                                    <UploadContainer
                                                        uploadType={
                                                            FileUploadType.DOCUMENTS
                                                        }
                                                        sessionID={roomId}
                                                    ></UploadContainer>
                                                </Row>
                                            </Row>
                                        </Container>
                                    </Container>
                                </Col>
                                <Col md={3}>
                                    <SidePanelContainer
                                        sessionId={roomId}
                                        username={props.userData.username}
                                        initialChatLog={sessionData.messages}
                                        users={users}
                                        raisedHandUsers={[]}
                                        roomType={RoomType.PRIVATE}
                                    />
                                </Col>
                            </Row>
                        </Container>
                    </>
                );
            }}
        </SessionContainer>
    );
};
