import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col, Nav, Collapse } from "react-bootstrap";

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
import "../styles/Homepage.less"

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
        <Container className="homepage no-padding" fluid>
            <Row className="nav">
            </Row>
            <Row className="content">
                <Container fluid className="no-padding">
                    <Col xl="12" lg="12" md="12">
                        <Container fluid className="no-padding">
                            <Col className="left-col col-6">
                                <Row className="calander no-padding">
                                    <Calendar sessions={[]}

                                    />
                                </Row>
                                <Row className="classes no-padding">
                                    <Row className="class-1">
                                        <Col xl="3" lg="3" className="course-code">
                                            <h3>DECO 3801</h3>
                                        </Col>
                                        <Col xl="5" lg="5" className="course-content">
                                            <h5>Tutorial</h5>
                                            <p>Today - 10:00</p>
                                            <p>Download Class Content</p>
                                        </Col>
                                        <Col className="connect">
                                            <h4>Connect</h4>
                                        </Col>
                                    </Row>
                                    <Row className="class-2">
                                        <Col xl="3" lg="3" className="course-code">
                                            <h3>CSSE 1001</h3>
                                        </Col>
                                        <Col xl="5" lg="5" className="course-content">
                                            <h5>Lecture</h5>
                                            <p>Today - 12:00</p>
                                            <p>Download Class Content</p>
                                        </Col>
                                        <Col className="connect">
                                            <h4>Connect</h4>
                                        </Col>
                                    </Row>
                                </Row>
                            </Col>

                            <Col className="right-col col-6">
                                <Row className="announcemnts no-padding">
                                    <AnnouncementsContainer
                                        refreshKey={refreshKey}
                                        userId={userData.id}
                                    />
                                </Row>
                                <Row className="bottom-right no-padding">
                                    <h1>Bottom-right</h1>
                                </Row>
                            </Col>
                        </Container>
                    </Col>
                </Container>
            </Row>
        </Container>
    );
};
