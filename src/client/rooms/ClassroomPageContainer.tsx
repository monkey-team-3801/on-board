import { List } from "immutable";
import React, { useRef } from "react";
import { Button, ButtonGroup, Col, Container, Row } from "react-bootstrap";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import { MdNotificationsActive, MdNotificationsOff } from "react-icons/md";
import { Link, RouteComponentProps } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { useDebouncedCallback } from "use-debounce";
import { ResponseFormEvent, RoomEvent } from "../../events";
import {
    ClassroomSessionData,
    FileUploadType,
    RoomType,
    UserDataResponseType,
    UserType,
} from "../../types";
import { Loader } from "../components";
import { FileModal } from "../filehandler/FileModal";
import { useDynamicFetch, useFetch } from "../hooks";
import { useMyPeer } from "../hooks/useMyPeer";
import { useScreenSharing } from "../hooks/useScreenSharing";
import { BreakoutRoomAllocateIndicator } from "../Indicators";
import { PeerContext } from "../peer";
import { ResponsesModal } from "../responses";
import { BreakoutAllocationEventData, TopLayerContainerProps } from "../types";
import { requestIsLoaded, isStaff } from "../utils";
import { ScreenSharingContainer } from "../videostreaming/ScreenSharingContainer";
import "./classroom.less";
import {
    StreamControl,
    HostDisplay,
    Progress,
    BreakoutRoomListModal,
    BreakoutRoomModal,
    Participants,
} from "./components";
import { SidePanelContainer } from "./containers";
import "./room.less";

type Props = RouteComponentProps<{ classroomId: string }> &
    TopLayerContainerProps & {};

const socket = socketIOClient("/");

/**
 * Container for handling the rendering of a single classroom page.
 */
export const ClassroomPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const notification = useRef(new Audio("/public/notification.wav"));
    const [soundEnabled, setSoundEnabled] = React.useState<boolean>(false);
    const { id: userId, userType } = props.userData;
    const { classroomId: sessionId } = props.match.params;
    const peerData = useMyPeer(socket, userId, sessionId);
    const [
        createBreakoutRoomModalVisible,
        setBreakoutRoomModalVisible,
    ] = React.useState<boolean>(false);

    const [showFileModal, setShowFileModal] = React.useState<boolean>(false);

    const [
        breakoutRoomListModalVisible,
        setBreakoutRoomListModalVisible,
    ] = React.useState<boolean>(false);
    const [responsesModalStatus, setResponsesModalStatus] = React.useState<{
        visible: boolean;
        type: "ask" | "result";
    }>({
        visible: false,
        type: "result",
    });

    const [sessionResponse] = useFetch<ClassroomSessionData, { id: string }>(
        "/session/getClassroomSession",
        {
            id: props.match.params.classroomId,
        }
    );
    const [sessionUsersResponse, fetchUsers] = useFetch<
        { users: Array<Omit<UserDataResponseType, "courses">> },
        { sessionId: string }
    >(
        "/session/getSessionUsers",
        {
            sessionId: props.match.params.classroomId,
        },
        false
    );

    const handRaisedRef = React.useRef<boolean>(false);

    const [raisedHandUsers, setRaisedHandUsers] = React.useState<List<string>>(
        List([])
    );

    const { setupScreenSharing, stopScreenSharing } = useScreenSharing(
        userId,
        sessionId
    );

    const [, addRaisedHand] = useDynamicFetch<
        undefined,
        { sessionId: string; userId: string }
    >("/session/addRaisedHandUser", undefined, false);

    const [, removeRaisedHand] = useDynamicFetch<
        undefined,
        { sessionId: string; userId: string }
    >("/session/removeRaisedHandUser", undefined, false);

    const [raisedHandUsersResponse, getRaisedHandUsers] = useFetch<
        { raisedHandUsers: Array<string> },
        { sessionId: string }
    >("/session/getRaisedHandUsers");

    const setRaisedHandStatus = useDebouncedCallback(
        async (remove: boolean) => {
            if (!remove) {
                await addRaisedHand({ sessionId, userId });
            } else {
                await removeRaisedHand({ sessionId, userId });
            }
            socket.emit(RoomEvent.USER_HAND_STATUS_CHANGED, sessionId);
        },
        1000
    );

    React.useEffect(() => {
        if (requestIsLoaded(raisedHandUsersResponse)) {
            const raisedHandUsers =
                raisedHandUsersResponse.data.raisedHandUsers;
            setRaisedHandUsers(List(raisedHandUsers));
            if (raisedHandUsers.includes(userId)) {
                handRaisedRef.current = true;
            }
        }
    }, [raisedHandUsersResponse, userId]);

    const [
        breakoutAllocationEventData,
        setBreakoutAllocationEventData,
    ] = React.useState<BreakoutAllocationEventData>();

    const onBreakoutRoomAllocate = React.useCallback(
        (users: Array<string>, roomIndex: number, roomId: string) => {
            if (users.includes(userId)) {
                setBreakoutAllocationEventData({
                    id: roomId,
                    roomIndex,
                });
            }
        },
        [userId]
    );

    const fetchSessionUsers = useDebouncedCallback(fetchUsers, 1000);

    const fetchRaisedHandUsers = useDebouncedCallback(getRaisedHandUsers, 1000);

    const onUserJoinOrLeave = React.useCallback(() => {
        fetchSessionUsers.callback();
    }, [fetchSessionUsers]);

    const onUserHandStatusChange = React.useCallback(() => {
        fetchRaisedHandUsers.callback();
    }, [fetchRaisedHandUsers]);

    const [altView, setAltView] = React.useState<boolean>(false);

    const video = (
        <Row className="video-container">
            <ScreenSharingContainer />
        </Row>
    );

    const participants = (
        <Container className="alt-view-users mt-4">
            <Participants
                users={sessionUsersResponse.data?.users || []}
                raisedHandUsers={raisedHandUsers.toArray()}
                myUserId={props.userData.id}
                size="lg"
            ></Participants>
        </Container>
    );

    const onNewForm = React.useCallback(() => {
        setSoundEnabled((prev) => {
            if (prev) {
                notification.current.play();
            }
            return prev;
        });
    }, [notification]);

    React.useEffect(() => {
        socket
            .connect()
            .on(RoomEvent.SESSION_JOIN, onUserJoinOrLeave)
            .on(RoomEvent.SESSION_LEAVE, onUserJoinOrLeave)
            .on(RoomEvent.BREAKOUT_ROOM_ALLOCATE, onBreakoutRoomAllocate)
            .on(RoomEvent.USER_HAND_STATUS_CHANGED, onUserHandStatusChange)
            .on(ResponseFormEvent.NEW_FORM, onNewForm)
            .emit(RoomEvent.SESSION_JOIN, {
                userId,
                sessionId,
            });
        fetchSessionUsers.callback();
        return () => {
            socket
                .disconnect()
                .off(RoomEvent.SESSION_JOIN, onUserJoinOrLeave)
                .off(RoomEvent.SESSION_LEAVE, onUserJoinOrLeave)
                .off(RoomEvent.BREAKOUT_ROOM_ALLOCATE, onBreakoutRoomAllocate)
                .off(ResponseFormEvent.NEW_FORM, onNewForm)
                .off(
                    RoomEvent.USER_HAND_STATUS_CHANGED,
                    onUserHandStatusChange
                );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            id: sessionId,
            roomType: RoomType.CLASS,
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

    const presenterView = React.useMemo(() => {
        return (
            <HostDisplay
                hostId={sessionResponse.data?.createdBy}
                myUserId={userId}
            />
        );
    }, [sessionResponse, userId]);

    if (!requestIsLoaded(sessionResponse)) {
        return <Loader full />;
    }

    return (
        <PeerContext.Provider value={peerData}>
            <Row>
                <Col className="mr-4">
                    <Row className="head-panel mt-4 mb-4">
                        <Col xs={4}>
                            <Container className="d-flex align-items-center">
                                <Link to="/classes">
                                    <Button
                                        className="justify-content-center back-btn"
                                        variant="light"
                                        size="sm"
                                    >
                                        <AiIcons.AiOutlineArrowLeft className="icon" />
                                        Back
                                    </Button>
                                </Link>
                                <h1 className="ml-2 m-0 text-truncate">
                                    {`${sessionResponse.data.courseCode} - ${sessionResponse.data.roomType}`}
                                </h1>
                            </Container>
                        </Col>
                        <Col xs={8}>
                            <div>
                                <Progress
                                    startTime={
                                        new Date(sessionResponse.data.startTime)
                                    }
                                    endTime={
                                        new Date(sessionResponse.data.endTime)
                                    }
                                />
                                <ButtonGroup
                                    className="view-control mt-2 d-flex justify-content-center toggle-container"
                                    size="sm"
                                >
                                    <p
                                        className={`pr-2 font-weight-bold ${
                                            !altView ? "active" : ""
                                        }`}
                                        onClick={() => {
                                            setAltView(false);
                                        }}
                                    >
                                        Speaker View
                                    </p>
                                    <p
                                        className={`pl-2 font-weight-bold ${
                                            altView ? "active" : ""
                                        }`}
                                        onClick={() => {
                                            setAltView(true);
                                        }}
                                    >
                                        Participants View
                                    </p>
                                </ButtonGroup>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Row className="classroom-row">
                                <Col
                                    sm={4}
                                    className="d-flex align-items-center justify-content-center"
                                >
                                    {altView ? null : presenterView}
                                    <div className="video-alt">
                                        {altView ? presenterView : null}
                                        {altView ? video : null}
                                    </div>
                                </Col>
                                <Col sm={8} className="video-column">
                                    {altView ? participants : video}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <Row className="d-flex justify-content-center">
                                <StreamControl
                                    setupScreenSharing={setupScreenSharing}
                                    stopScreenSharing={stopScreenSharing}
                                />
                            </Row>
                            <Row className="d-flex justify-content-center">
                                <ButtonGroup className="classroom-btn-grp d-flex mt-4"></ButtonGroup>
                            </Row>
                        </Col>
                        <Col sm={8} className="d-flex justify-content-center">
                            <ButtonGroup className="classroom-btn-grp d-flex mt-4">
                                <Button
                                    className="first-btn"
                                    id="settings-options"
                                    onClick={() => {
                                        setBreakoutRoomListModalVisible(true);
                                    }}
                                >
                                    <AiIcons.AiOutlineTeam className="setting-icon" />
                                    <p className="icon-label">Breakout Rooms</p>
                                </Button>
                                {isStaff(userType) && (
                                    <Button
                                        className="setting-btn"
                                        id="settings-options"
                                        onClick={() => {
                                            setBreakoutRoomModalVisible(true);
                                        }}
                                    >
                                        <AiIcons.AiOutlineCluster className="setting-icon" />
                                        <p className="icon-label">
                                            Manage Rooms
                                        </p>
                                    </Button>
                                )}
                                <Button
                                    className="setting-btn"
                                    onClick={async () => {
                                        if (handRaisedRef.current) {
                                            setRaisedHandUsers(
                                                raisedHandUsers.splice(
                                                    raisedHandUsers.indexOf(
                                                        userId
                                                    ),
                                                    1
                                                )
                                            );
                                        } else {
                                            setRaisedHandUsers(
                                                raisedHandUsers.concat([userId])
                                            );
                                        }
                                        setRaisedHandStatus.callback(
                                            handRaisedRef.current
                                        );
                                        handRaisedRef.current = !handRaisedRef.current;
                                    }}
                                >
                                    <FaIcons.FaRegHandPaper className="setting-icon " />
                                    <p className="icon-label">Raise Hand</p>
                                </Button>
                                <Button
                                    className="setting-btn"
                                    onClick={() => {
                                        setResponsesModalStatus({
                                            visible: true,
                                            type: "result",
                                        });
                                    }}
                                >
                                    <AiIcons.AiOutlineProfile className="setting-icon"></AiIcons.AiOutlineProfile>
                                    {props.userData.userType ===
                                    UserType.STUDENT ? (
                                        <p className="icon-label">
                                            View Questions
                                        </p>
                                    ) : (
                                        <p>View Results</p>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowFileModal(true);
                                    }}
                                    className="setting-btn"
                                >
                                    <AiIcons.AiOutlineUpload className="setting-icon" />
                                    <p className="icon-label">View Files</p>
                                </Button>
                                {props.userData.userType ===
                                    UserType.COORDINATOR && (
                                    <Button
                                        onClick={() => {
                                            setResponsesModalStatus({
                                                visible: true,
                                                type: "ask",
                                            });
                                        }}
                                        className="setting-btn"
                                    >
                                        <AiIcons.AiOutlineQuestionCircle className="setting-icon" />
                                        <p className="icon-label">
                                            Ask Questions
                                        </p>
                                    </Button>
                                )}
                                <Button
                                    className="end-btn"
                                    onClick={() => {
                                        setSoundEnabled((prev) => {
                                            return !prev;
                                        });
                                    }}
                                >
                                    {soundEnabled ? (
                                        <MdNotificationsActive className="setting-icon" />
                                    ) : (
                                        <MdNotificationsOff className="setting-icon" />
                                    )}
                                    <p className="icon-label">
                                        Toggle Notifications
                                    </p>
                                </Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                </Col>
                <Col md={3} className="p-0">
                    <SidePanelContainer
                        sessionId={sessionId}
                        username={props.userData.username}
                        initialChatLog={sessionResponse.data.messages}
                        users={sessionUsersResponse.data?.users}
                        raisedHandUsers={raisedHandUsers.toArray()}
                        roomType={RoomType.CLASS}
                        socket={socket}
                        myUserId={props.userData.id}
                    />
                </Col>
            </Row>
            <BreakoutRoomModal
                userData={sessionUsersResponse.data?.users || []}
                visible={createBreakoutRoomModalVisible}
                sessionId={props.match.params.classroomId}
                handleClose={() => {
                    setBreakoutRoomModalVisible(false);
                }}
            />
            <BreakoutRoomListModal
                {...props}
                visible={breakoutRoomListModalVisible}
                sessionId={props.match.params.classroomId}
                handleClose={() => {
                    setBreakoutRoomListModalVisible(false);
                }}
            />
            <BreakoutRoomAllocateIndicator
                {...props}
                event={breakoutAllocationEventData}
                onClose={() => {
                    setBreakoutAllocationEventData(undefined);
                }}
            />
            <ResponsesModal
                sid={sessionId}
                userid={props.userData.id}
                userType={props.userData.userType}
                sock={socket}
                modalVisible={responsesModalStatus.visible}
                closeModal={() => {
                    setResponsesModalStatus((prev) => {
                        return {
                            ...prev,
                            visible: false,
                        };
                    });
                }}
                modalType={responsesModalStatus.type}
            ></ResponsesModal>
            <FileModal
                uploadType={FileUploadType.DOCUMENTS}
                socket={socket}
                sessionID={sessionId}
                userID={props.userData.id}
                updateFiles={getFileData}
                files={files}
                roomType={RoomType.CLASS}
                showModal={showFileModal}
                setShowModal={setShowFileModal}
            ></FileModal>
        </PeerContext.Provider>
    );
};
