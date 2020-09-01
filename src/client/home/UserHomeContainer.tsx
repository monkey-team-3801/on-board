import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col } from "react-bootstrap";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

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
            <Row className="no-padding" >
                <Col lg="1" className="no-padding">
                    <Container fluid className="no-padding">
                        <Col>
                            <Navbar />
                        </Col>
                    </Container>
                </Col>
            <Col lg="11" >
            <Container fluid>    
                <Row className="no-padding">                
                    <Col lg="6">
                        <Container className="calender">
                            <Row>
                                <Calendar sessions={[]} />
                            </Row>
                        </Container>
                    </Col>
                    <Col xs lg="4" className="announcements">
                        <Container>
                            <Row>
                                <h1>Announcements</h1>
                            </Row>
                        </Container>
                    </Col>
               
                </Row>
            <Container fluid>
                <Row>
                    <Col  lg="4" className="open-rooms">
                        <h1>Open Rooms</h1>
                    </Col>
                    
                    <Col xs lg="4" className="classes">
                        <h1>Upcoming Classes</h1>
                    </Col>
                </Row>
                <Row>
                    <Col className="open-rooms">
                        <p>
                            Logged in as {userDataResponse.data.username}:{" "}
                            {userDataResponse.data.id}
                        </p>
                        <Button
                            variant="light"
                            size="sm"
                            onClick={() => {
                                localStorage.setItem(
                                    LocalStorageKey.JWT_TOKEN,
                                    ""
                                );
                                props.history.replace("/");
                            }}
                        >
                            Logout
                        </Button>
                    </Col>
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
                    <Col className="open-rooms">
                        <RoomDisplayContainer
                            data={sessionResponse.data.sessions}
                            onDeleteClick={onDeleteClick}
                            onJoinClick={onJoinClick}
                        />
                    </Col>
                    <Col className="class-2">
                        <Container>
                            <div className="class-2-background">
                                <h3>DECO3801</h3>
                                <Button>Connect</Button>
                            </div>
                        </Container>
                    </Col>
                </Row>
                <Row>
                    <CreateRoomPage
                        createRoom={async (name: string) => {
                            await createRoom({ name });
                            await refresh();
                        }}
                    />
                </Row>
            </Container>
            </Container>
        </Col>
        </Row>
        </Container>
    );
};
