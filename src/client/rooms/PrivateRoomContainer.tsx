import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import {
    FileUploadType,
    RoomType,
    SessionData,
    UserDataResponseType,
} from "../../types";
import { DrawingCanvas } from "../canvas";
import { FileModal } from "../filehandler/FileModal";
import { useDynamicFetch } from "../hooks";
import { TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import { SessionContainer, SidePanelContainer } from "./containers";

type Props = RouteComponentProps<{ roomId: string }> &
    TopLayerContainerProps & {
        roomType: RoomType;
    };

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { roomId } = props.match.params;

    const [fileData, getFileData] = useDynamicFetch<
        Array<{
            id: string;
            name: string;
            size: number;
            time: string;
            userId: string;
            username: string;
        }>,
        { id: string; roomType: RoomType; fileUploadType: FileUploadType }
    >(
        "/filehandler/getFiles",
        {
            id: roomId,
            roomType: RoomType.PRIVATE,
            fileUploadType: FileUploadType.DOCUMENTS,
        },
        true
    );

    const [files, setFiles] = React.useState<
        Array<{
            id: string;
            name: string;
            size: number;
            time: string;
            userId: string;
            username: string;
        }>
    >([]);

    React.useEffect(() => {
        if (requestIsLoaded(fileData)) {
            setFiles(fileData.data);
        }
    }, [fileData]);

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
                        {props.roomType === RoomType.BREAKOUT && (
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
                                        <Row>
                                            <FileModal
                                                uploadType={
                                                    FileUploadType.DOCUMENTS
                                                }
                                                socket={socket}
                                                sessionID={roomId}
                                                userID={props.userData.id}
                                                updateFiles={getFileData}
                                                files={files}
                                                roomType={props.roomType}
                                            ></FileModal>
                                        </Row>
                                    </Container>
                                </Col>
                                <Col md={3}>
                                    <SidePanelContainer
                                        sessionId={roomId}
                                        username={props.userData.username}
                                        myUserId={props.userData.id}
                                        initialChatLog={sessionData.messages}
                                        users={users}
                                        raisedHandUsers={[]}
                                        roomType={props.roomType}
                                        socket={socket}
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
