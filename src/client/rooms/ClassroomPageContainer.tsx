import { List } from "immutable";
import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { useDebouncedCallback } from "use-debounce";
import { RoomEvent } from "../../events";
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
import { BreakoutRoomAllocateIndicator } from "../Indicators";
import { ResponsesModal } from "../responses";
import { BreakoutAllocationEventData, TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import "./classroom.less";
import { BreakoutRoomModal } from "./components/";
import { SidePanelContainer } from "./containers";
import "./room.less";
// import { StreamSelectorWrapper } from "../video";
import * as AiIcons from "react-icons/ai";
import * as FaIcons from "react-icons/fa";
import * as BiIcons from "react-icons/bi";



type Props = RouteComponentProps<{ classroomId: string }> &
    TopLayerContainerProps & {};

const socket = socketIOClient("/");

export const ClassroomPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { id: userId } = props.userData;
    const { classroomId: sessionId } = props.match.params;
    const [
        createBreakoutRoomModalVisible,
        setBreakoutRoomModalVisible,
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

    React.useEffect(() => {
        socket
            .connect()
            .on(RoomEvent.SESSION_JOIN, onUserJoinOrLeave)
            .on(RoomEvent.SESSION_LEAVE, onUserJoinOrLeave)
            .on(RoomEvent.BREAKOUT_ROOM_ALLOCATE, onBreakoutRoomAllocate)
            .on(RoomEvent.USER_HAND_STATUS_CHANGED, onUserHandStatusChange)
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
                .off(
                    RoomEvent.USER_HAND_STATUS_CHANGED,
                    onUserHandStatusChange
                );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [fileData, getFileData] = useDynamicFetch<
        Array<Array<string>>,
        { sid: string; roomType: RoomType }
    >(
        "/filehandler/getFiles",
        { sid: sessionId, roomType: RoomType.CLASS },
        true
    );

    const [files, setFiles] = React.useState<Array<Array<string>>>([]);

    React.useEffect(() => {
        if (requestIsLoaded(fileData)) {
            setFiles(fileData.data);
        }
    }, [fileData]);

    if (!requestIsLoaded(sessionResponse)) {
        return <Loader full />;
    }

    return (
        <Container fluid className="classroom-container">
            <Col md={9}>
                <header className="d-flex head-panel">
                    <Container fluid>
                        <button className="back-button">
                            <AiIcons.AiOutlineArrowLeft className="icon" />
                            back
                        </button>
                        <h1>
                            {`${sessionResponse.data.courseCode} - ${sessionResponse.data.name}`}
                        </h1>
                        <p>{sessionResponse.data.roomType}</p>
                        <p>{sessionResponse.data.description}</p>
                    </Container>
                    <Container fluid className="time-remaining">
                        <p>{`Start time: ${sessionResponse.data.startTime}`}</p>
                        <p>{`end time: ${sessionResponse.data.endTime}`}</p>
                    </Container>
                </header>
                <Container fluid>
                    <div className="stream-container">
                        <Row>
                            <Col md={4}>
                                <div className="dflex justify-content-center align-items-center presenter-container">
                                    <div></div>
                                </div>
                            </Col>
                            <Col md={8}>
                                <Container className="view-control d-flex justify-content-center">
                                    <Button>Speaker View</Button>
                                    <Button>Participants View</Button>
                                </Container>
                                <Container className="video-container mt-4">
                                    {/* <StreamSelectorWrapper
                                        sessionId={props.match.params.classroomId}
                                        userId={props.userData.id}
                                    /> */}
                                </Container>
                                <Container className="room-control d-flex justify-content-center mt-4">
                                    <Button
                                        className="first-btn"
                                        onClick={() => {
                                            setBreakoutRoomModalVisible(true);
                                        }}
                                    >
                                        <AiIcons.AiOutlineTeam className="icon" />
                                        Breakout Rooms
                                    </Button>
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
                                                    raisedHandUsers.concat([
                                                        userId,
                                                    ])
                                                );
                                            }
                                            setRaisedHandStatus.callback(
                                                handRaisedRef.current
                                            );
                                            handRaisedRef.current = !handRaisedRef.current;
                                        }}
                                    >
                                        <FaIcons.FaRegHandPaper className="icon" />

                                        Raise Hand
                                    </Button>
                                    <Button className="setting-btn">
                                        {/* <BiIcons.BiVideo className="icon" /> */}
                                        <BiIcons.BiVideoOff className="icon" />
                                        {/* video icons for video on and off */}
                                        Camera off</Button>
                                    <Button className="setting-btn">
                                        {/* <BiIcons.BiMicrophone className="icon" /> */}
                                        <BiIcons.BiMicrophoneOff className="icon" />
                                        {/* icons for mic on and off */}
                                        Mic off</Button>
                                    <Button
                                        className="setting-btn"
                                        onClick={() => {
                                            setResponsesModalStatus({
                                                visible: true,
                                                type: "result",
                                            });
                                        }}
                                    >
                                        <AiIcons.AiOutlineProfile className="icon" />
                                        {props.userData.userType ===
                                            UserType.STUDENT
                                            ? "View Questions"
                                            : "View Results"}

                                    </Button>
                                    <Button className="end-btn">
                                        <AiIcons.AiOutlineUpload className="icon" />
                                        <FileModal
                                            uploadType={FileUploadType.DOCUMENTS}
                                            socket={socket}
                                            sessionID={sessionId}
                                            userID={props.userData.id}
                                            updateFiles={getFileData}
                                            files={files}
                                            roomType={RoomType.CLASS}
                                        ></FileModal>
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
                                            >
                                                <AiIcons.AiOutlineQuestionCircle className="icon" />
                                                Ask Questions
                                            </Button>
                                        )}
                                </Container>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </Col>
            <Col md={3}>
                <SidePanelContainer
                    sessionId={sessionId}
                    username={props.userData.username}
                    initialChatLog={sessionResponse.data.messages}
                    users={sessionUsersResponse.data?.users}
                    raisedHandUsers={raisedHandUsers.toArray()}
                    roomType={RoomType.CLASS}
                    socket={socket}
                />
            </Col>
            <BreakoutRoomModal
                userData={sessionUsersResponse.data?.users || []}
                visible={createBreakoutRoomModalVisible}
                sessionId={props.match.params.classroomId}
                handleClose={() => {
                    setBreakoutRoomModalVisible(false);
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
        </Container>
    );
};
