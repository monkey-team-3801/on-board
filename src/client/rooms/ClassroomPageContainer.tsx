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

type Props = RouteComponentProps<{ classroomId: string }> &
    TopLayerContainerProps & {};

const socket = socketIOClient("/");

export const ClassroomPageContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
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
            if (users.includes(props.userData.id)) {
                setBreakoutAllocationEventData({
                    id: roomId,
                    roomIndex,
                });
            }
        },
        []
    );

    const fetchSessionUsers = useDebouncedCallback(fetchUsers, 1000);

    const onUserJoinOrLeave = () => {
        console.log("join");
        fetchSessionUsers.callback();
    };

    React.useEffect(() => {
        socket
            .connect()
            .on(RoomEvent.SESSION_JOIN, onUserJoinOrLeave)
            .on(RoomEvent.SESSION_LEAVE, onUserJoinOrLeave)
            .on(RoomEvent.BREAKOUT_ROOM_ALLOCATE, onBreakoutRoomAllocate)
            .emit(RoomEvent.SESSION_JOIN, {
                userId: props.userData.id,
                sessionId: props.match.params.classroomId,
            });
        fetchSessionUsers.callback();
        return () => {
            socket
                .disconnect()
                .off(RoomEvent.SESSION_JOIN, onUserJoinOrLeave)
                .off(RoomEvent.SESSION_LEAVE, onUserJoinOrLeave)
                .off(RoomEvent.BREAKOUT_ROOM_ALLOCATE, onBreakoutRoomAllocate);
        };
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
                            <img src={`/filehandler/getPfp/${user.id}`}></img>
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
            {/* <Container>
                <StreamSelectorWrapper
                    sessionId={props.match.params.classroomId}
                    userId={props.userData.id}
                />
            </Container> */}
            <BreakoutRoomAllocateIndicator
                {...props}
                event={breakoutAllocationEventData}
                onClose={() => {
                    setBreakoutAllocationEventData(undefined);
                }}
            />
        </div>
    );
};
