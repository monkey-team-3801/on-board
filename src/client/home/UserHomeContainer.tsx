import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col } from "react-bootstrap";

import { useFetch, useDynamicFetch, useSocket } from "../hooks";
import { SessionResponseType } from "../../types";
import {
    LocalStorageKey,
    RequestState,
    TopLayerContainerProps,
} from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { requestIsLoaded } from "../utils";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";
import Navbar from "../navbar/Navbar";
import { Calendar } from "../timetable/Calendar";
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

    const [sessionResponse, refresh] = useFetch<SessionResponseType>(
        "session/sessions"
    );

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
            await refresh();
        },
        [deleteRoom, refresh]
    );

    const onJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/room/${id}`);
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

    if (!requestIsLoaded(sessionResponse)) {
        return <div>Loading</div>;
    }

    return (
        <Container>
            <Container fluid className="no-padding">
                <Row className="no-padding">
                    <Col xl="2" lg="2" className="no-padding">
                        <Container fluid className="no-padding">
                            <Col w-100>
                                <Navbar />
                            </Col>
                        </Container>
                    </Col>

                </Row>
            </Container>
            <Row>
                <h1>User Homepage</h1>
            </Row>
            <Row>
                <Col>
                    <p>
                        Logged in as {userData.username}: {userData.id}
                    </p>
                </Col>
                <Col xl="10" lg="10">
                    <Container fluid>
                        <Row className="no-padding">
                            <Col xl="6" lg="6">
                                <Container className="calender">
                                    <Row>
                                        <Calendar sessions={[]} />
                                    </Row>
                                </Container>
                            </Col>

                            <Col xl="6" xs lg="6" className="announcements">
                                <Container>
                                    <Row>
                                        <h1>Announcements</h1>
                                    </Row>
                                    <Row className="announcements">
                                        <Container>
                                            <Col>
                                                <Row>
                                                    <Col
                                                        xl="1"
                                                        xs
                                                        lg="1"
                                                        className="no-padding"
                                                    >
                                                        <div className="class-1-banner"></div>
                                                    </Col>
                                                    <Col xl="10" xs lg="10">
                                                        <Row>
                                                            <div>
                                                                <h3>
                                                                    CSSE1001
                                                                </h3>
                                                            </div>
                                                        </Row>
                                                        <Row>
                                                            <div>
                                                                <h4>
                                                                    Assignment 1
                                                                    Due
                                                                </h4>
                                                            </div>
                                                        </Row>
                                                        <Row>
                                                            <div>
                                                                <p className="announcement-time">
                                                                    Today
                                                                    10:30am
                                                                </p>
                                                            </div>
                                                        </Row>
                                                        <Row>
                                                            <div>
                                                                <p>
                                                                    A reminder
                                                                    your
                                                                    assignment
                                                                    is due
                                                                    tomorrow.
                                                                    Good luck!
                                                                </p>
                                                            </div>

                                                            <Container>
                                                                <Row>
                                                                    <Col
                                                                        xl="1"
                                                                        xs
                                                                        lg="1"
                                                                    >
                                                                        <div className="class-1-teacher"></div>
                                                                    </Col>

                                                                    <Col>
                                                                        <div className="class-1-teacher-name">
                                                                            <h5>
                                                                                Richard
                                                                                Thomas
                                                                            </h5>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </Container>
                                                            <div className="closing-banner"></div>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Container>
                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                        <Container fluid>
                            <Row className="no-padding">
                                <Col
                                    xs
                                    lg="6"
                                    xl="6"
                                    className="classes no-padding"
                                >
                                    <h1>Upcoming Classes</h1>
                                    <Row>
                                        <Col className="class-1">
                                            <Container>
                                                <div className="class-1-background">
                                                    <h3>CSSE1001</h3>
                                                    <Button>Connect</Button>
                                                </div>
                                            </Container>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="class-2">
                                            <Container>
                                                <div className="class-2-background">
                                                    <h3>DECO3801</h3>
                                                    <Button>Connect</Button>
                                                </div>
                                            </Container>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg="6" xl="6" className="open-rooms">
                                    <h1>Open Rooms</h1>
                                    <Row>
                                        <Col className="open-rooms">
                                            <RoomDisplayContainer
                                                data={
                                                    sessionResponse.data
                                                        .sessions
                                                }
                                                onDeleteClick={onDeleteClick}
                                                onJoinClick={onJoinClick}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <CreateRoomPage
                                            createRoom={async (
                                                name: string
                                            ) => {
                                                await createRoom({ name });
                                                await refresh();
                                            }}
                                        />
                                    </Row>
                                </Col>
                            </Row>
                        </Container>
                    </Container>
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
