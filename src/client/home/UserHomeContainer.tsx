import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col } from "react-bootstrap";

import { useFetch, useDynamicFetch } from "../hooks";
import { UserDataResponseType, SessionResponseType } from "../../types";
import { LocalStorageKey, RequestState } from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { requestIsLoaded } from "../utils";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";
import Navbar from "../navbar/Navbar";
import { Calendar } from "../timetable/Calendar";

type Props = RouteComponentProps & {};

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { history } = props;
    const [userDataResponse] = useFetch<UserDataResponseType>("/user/data");

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

    if (createRoomResponse.state === RequestState.ERROR) {
        return <div>Error while creating room</div>;
    }

    if (deleteRoomResponse.state === RequestState.ERROR) {
        return <div>Error while deleting room</div>;
    }

    if (
        !requestIsLoaded(userDataResponse) ||
        !requestIsLoaded(sessionResponse)
    ) {
        return <div>Loading</div>;
    }

    return (
        <Container fluid className="no-padding">
            <Row className="no-padding">
                <Col xl="2" lg="2" className="no-padding">
                    <Container fluid className="no-padding">
                        <Col w-100>
                            <Navbar />
                        </Col>
                    </Container>
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
        </Container>
    );
};
