import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col, Nav, Collapse } from "react-bootstrap";

import { useFetch, useDynamicFetch, useSocket } from "../hooks";
import {
    SessionResponseType,
    SessionRequestType,
    RoomType,
    SessionDeleteRequestType,
} from "../../types";
import {
    LocalStorageKey,
    RequestState,
    TopLayerContainerProps,
} from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { ScheduleRoomFormContainer } from "../rooms/ScheduleRoomFormContainer";
import { requestIsLoaded } from "../utils";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";

import { Calendar, UpcomingEventsContainer } from "../timetable";
import { CreateAnnouncementsForm } from "../announcements";
import { AnnouncementsContainer } from "../announcements/AnnouncementsContainer";
import { EnrolFormContainer } from "../courses";
import { AnnouncementEvent } from "../../events";
import "../styles/Homepage.less";
import { ClassesContainer } from "./ClassesContainer";
import { ContainerWrapper } from "../components";

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

    if (
        !requestIsLoaded(privateRoomsResponse) ||
        !requestIsLoaded(classroomsResponse)
    ) {
        return <div>Loading</div>;
    }

    return (
        <div className="homepage">
            <Row>
                <Col xl="6" lg="6" md="12">
                    <Row>
                        <ContainerWrapper className="calendar">
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
            </Row>
        </div>
    );
};
