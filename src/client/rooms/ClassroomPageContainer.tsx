import { List } from "immutable";
import React from "react";
import { Button, Container, Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { useDebouncedCallback } from "use-debounce";
import { RoomEvent } from "../../events";
import {
    ClassroomSessionData,
    UserDataResponseType,
    RoomType,
    UserType,
} from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { BreakoutRoomAllocateIndicator } from "../Indicators";
import { ResponsesModal } from "../responses";
import { BreakoutAllocationEventData, TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import "./classroom.less";
import { BreakoutRoomModal } from "./components/";
import { ParticipantsContainer } from "./containers";
import { Loader } from "../components";
import { ChatContainer } from "../chat";
// import { StreamSelectorWrapper } from "../video";

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

    if (!requestIsLoaded(sessionResponse)) {
        return <Loader full />;
    }

    return (
        <Container fluid className="classroom-container">
            <Col md={9}>
                <header className="d-flex">
                    <Container fluid>
                        <h1>
                            {`${sessionResponse.data.courseCode} - ${sessionResponse.data.name}`}
                        </h1>
                        <p>{sessionResponse.data.roomType}</p>
                        <p>{sessionResponse.data.description}</p>
                    </Container>
                    <Container fluid>
                        <p>{`Start time: ${sessionResponse.data.startTime}, end time: ${sessionResponse.data.endTime}`}</p>
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
                                        onClick={() => {
                                            setBreakoutRoomModalVisible(true);
                                        }}
                                    >
                                        Breakout Rooms
                                    </Button>
                                    <Button
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
                                        Raise Hand
                                    </Button>
                                    <Button>Camera off</Button>
                                    <Button>Mic off</Button>
                                    <Button
                                        onClick={() => {
                                            setResponsesModalStatus({
                                                visible: true,
                                                type: "result",
                                            });
                                        }}
                                    >
                                        {props.userData.userType ===
                                        UserType.STUDENT
                                            ? "View Questions"
                                            : "View Results"}
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
                <Container className="panel">
                    <Row className="mt-4">
                        <div className="panel-container tutors-container">
                            <Container fluid>
                                <h4>Tutors</h4>
                            </Container>
                        </div>
                    </Row>
                    <Row className="mt-4">
                        <Container className="panel-container students-container d-flex flex-column">
                            <Row>
                                <h4>Participants</h4>
                            </Row>
                            {sessionUsersResponse.data?.users ? (
                                <ParticipantsContainer
                                    users={sessionUsersResponse.data.users}
                                    raisedHandUsers={raisedHandUsers.toArray()}
                                />
                            ) : (
                                <Loader />
                            )}
                        </Container>
                    </Row>
                    <Row className="mt-4">
                        <div className="panel-container messages-container">
                            <Container fluid>
                                <h4>Chat</h4>
                            </Container>
                            <Container fluid>
                                <ChatContainer
                                    roomId={sessionId}
                                    username={props.userData.username}
                                    initialChatLog={
                                        sessionResponse.data.messages
                                    }
                                    roomType={RoomType.CLASS}
                                />
                            </Container>
                        </div>
                    </Row>
                </Container>
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
