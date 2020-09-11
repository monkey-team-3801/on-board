import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col } from "react-bootstrap";

import { useFetch, useDynamicFetch, useSocket } from "../hooks";
import { SessionResponseType, SessionRequestType, RoomType } from "../../types";
import {
    LocalStorageKey,
    RequestState,
    TopLayerContainerProps,
} from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { ScheduleRoomFormContainer } from "../rooms/ScheduleRoomFormContainer";
import { requestIsLoaded } from "../utils";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";
import { CreateAnnouncementsForm } from "../announcements";
import { AnnouncementsContainer } from "../announcements/AnnouncementsContainer";
import { EnrolFormContainer } from "../courses";
import { AnnouncementEvent } from "../../events";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { history, userData } = props;
    const { courses } = userData;

    const [refreshKey, setRefreshKey] = React.useState<number>(0);

    const [deleteRoomResponse, deleteRoom] = useDynamicFetch<
        undefined,
        { id: string }
    >("session/delete", undefined, false);

    const [createRoomResponse, createRoom] = useDynamicFetch<
        undefined,
        { name: string }
    >("session/create", undefined, false);

    const [privateRoomsResponse, refreshPrivateRooms] = useFetch<
        SessionResponseType,
        SessionRequestType
    >("session/sessions", {
        roomType: RoomType.PRIVATE,
    });

    const [classroomsResponse, refreshClassrooms] = useFetch<
        SessionResponseType,
        SessionRequestType
    >("session/sessions", {
        roomType: RoomType.CLASS,
    });

    const componentDidMount = React.useCallback(
        (socket: SocketIOClient.Socket) => {
            return socket.emit(
                AnnouncementEvent.COURSE_ANNOUNCEMENTS_SUBSCRIBE,
                {
                    courses,
                }
            );
        },
        [courses]
    );

    const { socket } = useSocket(
        AnnouncementEvent.NEW,
        undefined,
        componentDidMount,
        () => {
            setRefreshKey((k) => {
                return k + 1;
            });
        }
    );

    const onDeleteClick = React.useCallback(
        async (id: string) => {
            await deleteRoom({
                id,
            });
            await refreshPrivateRooms();
            await refreshClassrooms();
        },
        [deleteRoom, refreshPrivateRooms, refreshClassrooms]
    );

    const onPrivateRoomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/room/${id}`);
        },
        [history]
    );

    const onClassroomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/classroom/${id}`);
        },
        [history]
    );

    const refreshAnnouncements = React.useCallback(() => {
        setRefreshKey((k) => {
            return k + 1;
        });
    }, []);

    if (createRoomResponse.state === RequestState.ERROR) {
        return <div>Error while creating room</div>;
    }

    if (deleteRoomResponse.state === RequestState.ERROR) {
        return <div>Error while deleting room</div>;
    }

    if (
        !requestIsLoaded(privateRoomsResponse) ||
        !requestIsLoaded(classroomsResponse)
    ) {
        return <div>Loading</div>;
    }

    return (
        <Container>
            <Row>
                <h1>User Homepage</h1>
            </Row>
            <Row>
                <Col>
                    <p>
                        Logged in as {userData.username}: {userData.id}
                    </p>
                </Col>
                <Col>
                    <Button
                        variant="light"
                        size="sm"
                        onClick={() => {
                            localStorage.setItem(LocalStorageKey.JWT_TOKEN, "");
                            props.history.replace("/");
                        }}
                    >
                        Logout
                    </Button>
                </Col>
            </Row>
            <Row>
                <RoomDisplayContainer
                    data={classroomsResponse.data.sessions}
                    onDeleteClick={onDeleteClick}
                    onJoinClick={onClassroomJoinClick}
                />
            </Row>
            <hr></hr>
            <Row>
                <RoomDisplayContainer
                    data={privateRoomsResponse.data.sessions}
                    onDeleteClick={onDeleteClick}
                    onJoinClick={onPrivateRoomJoinClick}
                />
            </Row>
            <Row>
                <CreateRoomPage
                    createRoom={async (name: string) => {
                        await createRoom({ name });
                        await refreshPrivateRooms();
                    }}
                />
            </Row>
            <Row>
                <Col>
                    <EnrolFormContainer
                        refresh={refreshAnnouncements}
                        userId={userData.id}
                        socket={socket}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <ScheduleRoomFormContainer userId={userData.id} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <CreateAnnouncementsForm userId={userData.id} />
                </Col>
                <Col>
                    <AnnouncementsContainer
                        refreshKey={refreshKey}
                        userId={userData.id}
                    />
                </Col>
            </Row>
        </Container>
    );
};
