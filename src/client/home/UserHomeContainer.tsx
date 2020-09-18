import React from "react";
import { Col, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { AnnouncementEvent } from "../../events";
import {
<<<<<<< HEAD
    LocalStorageKey,
    RequestState,
    TopLayerContainerProps,
} from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { requestIsLoaded } from "../utils";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";
import { SignInEvent, SendOnlineUsersEvent } from "../../events";
=======
    RoomType,
    SessionDeleteRequestType,
    SessionRequestType,
    SessionResponseType,
} from "../../types";
>>>>>>> master
import { CreateAnnouncementsForm } from "../announcements";
import { AnnouncementsContainer } from "../announcements/AnnouncementsContainer";
import { ContainerWrapper } from "../components";
import { EnrolFormContainer } from "../courses";
import { useDynamicFetch, useFetch, useSocket } from "../hooks";
import { CreateRoomForm } from "../rooms/CreateRoomForm";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";
import { ScheduleRoomFormContainer } from "../rooms/ScheduleRoomFormContainer";
import "../styles/Homepage.less";
import { Calendar } from "../timetable";
import { RequestState, TopLayerContainerProps } from "../types";
import { ClassesContainer } from "./ClassesContainer";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { history, userData } = props;
    const { courses } = userData;

    const [refreshKey, setRefreshKey] = React.useState<number>(0);

    const [deleteRoomResponse, deleteRoom] = useDynamicFetch<
        undefined,
        SessionDeleteRequestType
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

    socket.emit(SignInEvent.USER_SIGNEDIN, userData.username);
    
    /*
    socket.on(SendOnlineUsersEvent.ONLINE_USERS_LIST, function (data: {
        ONLINE_USERS_LIST: any;
    }) {
        console.log(data.ONLINE_USERS_LIST);
    });
*/

    socket.on(SendOnlineUsersEvent.ONLINE_USERS_LIST, function (
        data: Array<{}>
    ) {
        console.log(data);
    });

    const onDeleteClick = React.useCallback(
        async (request: SessionDeleteRequestType) => {
            await deleteRoom(request);
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

    return (
<<<<<<< HEAD
        <Container>
            <Row>
                <h1>User Homepage</h1>
            </Row>
            <Row>
                <h1> Online Users: {} </h1>
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
                    data={sessionResponse.data.sessions}
                    onDeleteClick={onDeleteClick}
                    onJoinClick={onJoinClick}
                />
            </Row>
            <Row>
                <CreateRoomPage
                    createRoom={async (name: string) => {
                        await createRoom({ name });
                        await refresh();
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
=======
        <div className="homepage">
>>>>>>> master
            <Row>
                <Col xl="6" lg="6" md="12">
                    <Row>
                        <ContainerWrapper className="calendar" title="Calendar">
                            {(setShowLoader) => {
                                return (
                                    <Calendar
                                        setShowLoader={setShowLoader}
                                        sessions={[]}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper
                            className="classes-container"
                            title="Classes"
                        >
                            {(setShowLoader) => {
                                return (
                                    <ClassesContainer
                                        setShowLoader={setShowLoader}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper>
                            {(setShowLoader) => {
                                return (
                                    <CreateRoomForm
                                        createRoom={async (name: string) => {
                                            await createRoom({ name });
                                            await refreshPrivateRooms();
                                        }}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Private rooms">
                            {(setShowLoader) => {
                                return (
                                    privateRoomsResponse.data && (
                                        <RoomDisplayContainer
                                            data={
                                                privateRoomsResponse.data
                                                    .sessions
                                            }
                                            onDeleteClick={async (
                                                id: string
                                            ) => {
                                                onDeleteClick({
                                                    id,
                                                    roomType: RoomType.PRIVATE,
                                                });
                                            }}
                                            onJoinClick={onPrivateRoomJoinClick}
                                        />
                                    )
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper title="Class rooms">
                            {(setShowLoader) => {
                                return (
                                    classroomsResponse.data && (
                                        <RoomDisplayContainer
                                            data={
                                                classroomsResponse.data.sessions
                                            }
                                            onDeleteClick={async (
                                                id: string
                                            ) => {
                                                onDeleteClick({
                                                    id,
                                                    roomType: RoomType.CLASS,
                                                });
                                            }}
                                            onJoinClick={onClassroomJoinClick}
                                        />
                                    )
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                </Col>
                <Col xl="6" lg="6" md="12">
                    <Row>
                        <ContainerWrapper
                            className="announcements-container"
                            title="Announcements"
                        >
                            {(setShowLoader) => {
                                return (
                                    <AnnouncementsContainer
                                        refreshKey={refreshKey}
                                        userId={userData.id}
                                        setShowLoader={setShowLoader}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper>
                            {(setShowLoader) => {
                                return (
                                    <EnrolFormContainer
                                        refresh={refreshAnnouncements}
                                        userId={userData.id}
                                        socket={socket}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper>
                            {(setShowLoader) => {
                                return (
                                    <ScheduleRoomFormContainer
                                        userId={userData.id}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                    <Row>
                        <ContainerWrapper>
                            {(setShowLoader) => {
                                return (
                                    <CreateAnnouncementsForm
                                        userId={userData.id}
                                    />
                                );
                            }}
                        </ContainerWrapper>
                    </Row>
                </Col>
                <Col>
                    <EnrolFormContainer
                        refresh={refreshAnnouncements}
                        userId={userData.id}
                        socket={socket}
                    />
                </Col>
            </Row>
        </div>
    );
};
