import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import {
    ClassroomSessionData,
    RoomType,
    SessionDeleteRequestType,
} from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { UserData } from "../rooms/types";
import { requestIsLoaded } from "../utils";
import { EditClassroomModal } from "./EditClassroomModal";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    userData: UserData;
};

export const ClassroomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, history } = props;

    const [roomSelection, setRoomSelection] = React.useState<
        | { data: Omit<ClassroomSessionData, "messages">; type: RoomType }
        | undefined
    >();

    const [classroomsResponse, getClassrooms] = useFetch<
        Array<ClassroomSessionData>
    >("session/classroomSessions");

    const [upcomingClassroomsResponse, getUpcomingClassrooms] = useFetch<
        Array<Omit<ClassroomSessionData, "messages">>
    >("session/upcomingClassroomSessions");

    const [, deleteRoom] = useDynamicFetch<undefined, SessionDeleteRequestType>(
        "session/delete/classroom",
        undefined,
        false
    );

    const onRoomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/classroom/${id}`);
        },
        [history]
    );

    React.useEffect(() => {
        if (requestIsLoaded(classroomsResponse)) {
            setLoading(false);
        }
    }, [classroomsResponse, setLoading]);

    return (
        <Container>
            {classroomsResponse.data &&
                classroomsResponse.data.map((session, i) => {
                    return (
                        <Row key={session.id}>
                            <Col>
                                <p>{`${i + 1}. ${session.name}`}</p>
                            </Col>
                            <Col>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => {
                                        onRoomJoinClick(session.id);
                                    }}
                                >
                                    Join
                                </Button>
                                {props.userData.id === session.createdBy && (
                                    <>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={async () => {
                                                setRoomSelection({
                                                    data: session,
                                                    type: RoomType.CLASS,
                                                });
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                await deleteRoom({
                                                    id: session.id,
                                                });
                                                await getClassrooms();
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </Col>
                        </Row>
                    );
                })}
            <hr></hr>
            {upcomingClassroomsResponse.data &&
                upcomingClassroomsResponse.data.map((session, i) => {
                    return (
                        <Row key={session.id}>
                            <Col>
                                <p>{`${i + 1}. ${session.name}`}</p>
                            </Col>
                            <Col>
                                {props.userData.id === session.createdBy && (
                                    <>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={async () => {
                                                setRoomSelection({
                                                    data: session,
                                                    type: RoomType.UPCOMING,
                                                });
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={async () => {
                                                await deleteRoom({
                                                    id: session.id,
                                                });
                                                await getClassrooms();
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </Col>
                        </Row>
                    );
                })}
            <EditClassroomModal
                roomSelection={roomSelection}
                onClose={() => {
                    setRoomSelection(undefined);
                }}
                refresh={() => {
                    getClassrooms();
                    getUpcomingClassrooms();
                }}
            />
        </Container>
    );
};
