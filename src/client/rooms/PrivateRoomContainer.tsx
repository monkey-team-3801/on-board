import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import * as AiIcons from "react-icons/ai";
import { Link, RouteComponentProps } from "react-router-dom";
import {
    FileUploadType,
    RoomType,
    SessionData,
    UserDataResponseType,
} from "../../types";
import { DrawingCanvas } from "../canvas";
import { FileModal } from "../filehandler/FileModal";
import { useDynamicFetch } from "../hooks";
import { useScreenSharing } from "../hooks/useScreenSharing";
import { TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import { ScreenSharingContainer } from "../videostreaming/ScreenSharingContainer";
import { StreamControl } from "./components";
import { SessionContainer, SidePanelContainer } from "./containers";
import "./PrivateRoom.less";

type Props = RouteComponentProps<{ roomId: string }> &
    TopLayerContainerProps & {
        roomType: RoomType;
    };

/**
 * Container for displaying a single private room page.
 */
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

    const { setupScreenSharing, stopScreenSharing } = useScreenSharing(
        props.userData.id,
        roomId
    );

    const [showFileModal, setShowFileModal] = React.useState<boolean>(false);

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
                        <Container fluid className="private-room-container p-0">
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
                                                            {sessionData.parentSessionId && (
                                                                <Link
                                                                    to={`/classroom/${sessionData.parentSessionId}`}
                                                                >
                                                                    <Button
                                                                        variant="light"
                                                                        size="sm"
                                                                        className="d-flex align-items-center"
                                                                    >
                                                                        Main
                                                                        Room
                                                                    </Button>
                                                                </Link>
                                                            )}

                                                            <span className="session-name d-flex align-items-center ml-2">
                                                                <h1 className="m-0 text-truncate">{`${sessionData.name}`}</h1>
                                                            </span>
                                                        </div>
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
                                    <Container
                                        fluid
                                        className="room-content-container d-flex align-items-center justify-content-center"
                                    >
                                        {showCanvas ? (
                                            <DrawingCanvas
                                                sessionId={sessionData.id}
                                                socket={socket}
                                            />
                                        ) : (
                                            <ScreenSharingContainer />
                                        )}
                                    </Container>
                                    <Row className="d-flex justify-content-center">
                                        <StreamControl
                                            setupScreenSharing={
                                                setupScreenSharing
                                            }
                                            stopScreenSharing={
                                                stopScreenSharing
                                            }
                                        >
                                            <Button
                                                className="end-btn"
                                                id="settings-options"
                                                onClick={() => {
                                                    setShowFileModal(true);
                                                }}
                                            >
                                                <AiIcons.AiOutlineUpload className="setting-icon" />
                                                <p className="icon-label">
                                                    View Files
                                                </p>
                                            </Button>
                                        </StreamControl>
                                    </Row>
                                </Col>
                                <Col md={3} className="p-0">
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
                        <FileModal
                            uploadType={FileUploadType.DOCUMENTS}
                            socket={socket}
                            sessionID={roomId}
                            userID={props.userData.id}
                            updateFiles={getFileData}
                            files={files}
                            roomType={props.roomType}
                            showModal={showFileModal}
                            setShowModal={setShowFileModal}
                        />
                    </>
                );
            }}
        </SessionContainer>
    );
};
