import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col, Nav } from "react-bootstrap";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { useFetch, useDynamicFetch } from "../hooks";
import { UserDataResponseType, SessionResponseType } from "../../types";
import { LocalStorageKey, RequestState } from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { requestIsLoaded } from "../utils";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";
import { fromUnixTime } from "date-fns/esm";
import Navbar from "../navbar/Navbar";

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
        <>           
            <Router>
                <Navbar />
                <Switch>
                    <Route path="/" />
                </Switch>
            </Router>            
            <Container>
                <Container>
                    <Row>
                        <h1>User Homepage</h1>
                    </Row>
                    <Row>
                        <Col>
                            <p>
                                Logged in as {userDataResponse.data.username}:{" "}
                                {userDataResponse.data.id}
                            </p>
                        </Col>
                        <Col>
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
                </Container>
            </Container>
        </>
    );
};
