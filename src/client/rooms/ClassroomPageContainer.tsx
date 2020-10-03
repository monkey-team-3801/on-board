import { List } from "immutable";
import React from "react";
import { Button, Container } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { useDebouncedCallback } from "use-debounce";
import { RoomEvent } from "../../events";
import { ClassroomSessionData, UserDataResponseType } from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { BreakoutRoomAllocateIndicator } from "../Indicators";
import { ResponseTest } from "../responses/ResponseTest";
import { BreakoutAllocationEventData, TopLayerContainerProps } from "../types";
import { requestIsLoaded } from "../utils";
import "./classroom.less";
import { BreakoutRoomModal } from "./components/";
import { ParticipantsContainer } from "./containers";
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
        return <div>Loading</div>;
    }

    return (
        <div>
            <h1>
                {sessionResponse.data.courseCode} Classroom:{" "}
                {sessionResponse.data.name}
            </h1>
            <p>Description: {sessionResponse.data.description}</p>
            <p>Start time: {sessionResponse.data.startTime}</p>
            <p>End time: {sessionResponse.data.endTime}</p>
            <div>id: {props.match.params.classroomId}</div>
            <Container>
                <Button
                    onClick={() => {
                        setBreakoutRoomModalVisible(true);
                    }}
                >
                    Breakout Rooms
                </Button>
            </Container>
            <Container>
                <Button
                    onClick={async () => {
                        if (handRaisedRef.current) {
                            setRaisedHandUsers(
                                raisedHandUsers.splice(
                                    raisedHandUsers.indexOf(userId),
                                    1
                                )
                            );
                        } else {
                            setRaisedHandUsers(
                                raisedHandUsers.concat([userId])
                            );
                        }
                        setRaisedHandStatus.callback(handRaisedRef.current);
                        handRaisedRef.current = !handRaisedRef.current;
                    }}
                >
                    Raise Hand
                </Button>
            </Container>
            {sessionUsersResponse.data?.users ? (
                <ParticipantsContainer
                    users={sessionUsersResponse.data.users}
                    raisedHandUsers={raisedHandUsers.toArray()}
                />
            ) : (
                <div>loading</div>
            )}

            <BreakoutRoomModal
                userData={sessionUsersResponse.data?.users || []}
                visible={createBreakoutRoomModalVisible}
                sessionId={props.match.params.classroomId}
                handleClose={() => {
                    setBreakoutRoomModalVisible(false);
                }}
            />
            {/* <StreamSelectorWrapper
                sessionId={props.match.params.classroomId}
                userId={props.userData.id}
            /> */}
            <BreakoutRoomAllocateIndicator
                {...props}
                event={breakoutAllocationEventData}
                onClose={() => {
                    setBreakoutAllocationEventData(undefined);
                }}
            />
            <ResponseTest
                sid={sessionId}
                userid={props.userData.id}
                userType={props.userData.userType}
                sock={socket}
            ></ResponseTest>
        </div>
    );
};
