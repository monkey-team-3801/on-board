import React from "react";
import socketIOClient from "socket.io-client";
import { RouteComponentProps } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import { TopLayerContainerProps, BreakoutAllocationEventData } from "../types";
import { requestIsLoaded } from "../utils";
import { useFetch } from "../hooks";
import { ClassroomSessionData, UserDataResponseType } from "../../types";
import { Container, Button } from "react-bootstrap";
import { StreamSelectorWrapper } from "../video/StreamSelectorWrapper";
import { RoomEvent } from "../../events";
import { BreakoutRoomModal } from "./components/";
import { BreakoutRoomAllocateIndicator } from "../Indicators";
import { ResponseTest } from "../responses/ResponseTest";

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

    const onUserJoinOrLeave = React.useCallback(() => {
        fetchSessionUsers.callback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                {sessionUsersResponse.data?.users.map((user) => {
                    return (
                        <div key={user.id}>
                            {user.username}
                            <img
                                src={`/filehandler/getPfp/${user.id}`}
                                alt="profile"
                            ></img>
                        </div>
                    );
                })}
            </Container>
            <BreakoutRoomModal
                userData={sessionUsersResponse.data?.users || []}
                visible={createBreakoutRoomModalVisible}
                sessionId={props.match.params.classroomId}
                handleClose={() => {
                    setBreakoutRoomModalVisible(false);
                }}
            />
            <Container>
                <StreamSelectorWrapper
                    sessionId={props.match.params.classroomId}
                    userId={props.userData.id}
                />
            </Container>
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
