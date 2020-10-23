import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import * as AiIcons from "react-icons/ai";
import { Link, RouteComponentProps } from "react-router-dom";
import {
    FileUploadType,
    RoomType,
    SessionData,
    UserDataResponseType
} from "../../types";
import { DrawingCanvas } from "../canvas";
import { FileModal } from "../filehandler/FileModal";
import { useDynamicFetch } from "../hooks";
import { TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import { ScreenSharingContainer } from "../videostreaming/ScreenSharingContainer";
import { SessionContainer, SidePanelContainer } from "./containers";
import "./PrivateRoom.less";

type Props = RouteComponentProps<{ roomId: string }> &
    TopLayerContainerProps & {
        roomType: RoomType;
    };

export const PrivateRoomContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { roomId } = props.match.params;

    const [showCanvas, setShowCanvas] = React.useState<boolean>(true);

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
                        <Container
                            fluid
                            className="private-room-container pr-0"
                        >
                            <Row>
                                <Col md={9}>
                                    <header className="d-flex info-header">
                                        <Container fluid>
                                            <Row>
                                                <Col>
                                                    <Row className="d-flex justify-content-between">
                                                        <div className="d-flex align-items-center">
                                                            <Link to="/classes">
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    className="d-flex align-items-center"
                                                                >
                                                                    <AiIcons.AiOutlineArrowLeft className="mr-2" />
                                                                    Back
                                                                </Button>
                                                            </Link>
                                                            <span className="session-name d-flex align-items-center ml-2">
                                                                <h1 className="m-0 text-truncate">{`${sessionData.name}`}</h1>
                                                            </span>
                                                        </div>
                                                        <FileModal
                                                            uploadType={
                                                                FileUploadType.DOCUMENTS
                                                            }
                                                            socket={socket}
                                                            sessionID={roomId}
                                                            userID={
                                                                props.userData
                                                                    .id
                                                            }
                                                            updateFiles={
                                                                getFileData
                                                            }
                                                            files={files}
                                                            roomType={
                                                                props.roomType
                                                            }
                                                            size={"sm"}
                                                        />
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col className="d-flex justify-content-center toggle-container">
                                                    <p
                                                        className={`pr-2 font-weight-bold ${
                                                            !showCanvas
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setShowCanvas(
                                                                false
                                                            );
                                                        }}
                                                    >
                                                        Share Screen
                                                    </p>
                                                    <p
                                                        className={`pl-2 font-weight-bold ${
                                                            showCanvas
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setShowCanvas(true);
                                                        }}
                                                    >
                                                        Canvas
                                                    </p>
                                                </Col>
                                            </Row>
                                        </Container>
                                    </header>
                                    <Container fluid>
                                        {showCanvas ? (
                                            <DrawingCanvas
                                                sessionId={sessionData.id}
                                                socket={socket}
                                            />
                                        ) : (
                                            <ScreenSharingContainer
                                                userId={props.userData.id}
                                                sessionId={sessionData.id}
                                            />
                                        )}
                                    </Container>
                                </Col>
                                <Col md={3} className="pr-0">
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
