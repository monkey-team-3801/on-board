import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Container, Row, Button, Col } from "react-bootstrap";

import { useFetch, useDynamicFetch } from "../hooks";
import { SessionResponseType } from "../../types";
import {
    LocalStorageKey,
    RequestState,
    TopLayerContainerProps,
} from "../types";
import { CreateRoomPage } from "../rooms/CreateRoomPage";
import { requestIsLoaded } from "../utils";
import { RoomDisplayContainer } from "../rooms/RoomDisplayContainer";
import { CreateAnnouncementsForm } from "../announcements";
import { AnnouncementsContainer } from "../announcements/AnnouncementsContainer";
import { EnrolFormContainer } from "../courses";

type Props = RouteComponentProps & TopLayerContainerProps & {};

export const UserHomeContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { history, userData } = props;

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

    if (!requestIsLoaded(sessionResponse)) {
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
                        refresh={() => {
                            setRefreshKey((k) => {
                                return k + 1;
                            });
                        }}
                        userId={userData.id}
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
