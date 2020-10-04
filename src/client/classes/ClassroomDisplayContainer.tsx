import React from "react";
import { Container, Row, Button, Col } from "react-bootstrap";

import {
    SessionInfo,
    ClassroomSessionData,
    SessionDeleteRequestType,
} from "../../types";
import { useFetch, useDynamicFetch } from "../hooks";
import { requestIsLoaded } from "../utils";
import { RouteComponentProps } from "react-router-dom";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ClassroomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, history } = props;

    const [classroomsResponse, getClassrooms] = useFetch<
        Array<ClassroomSessionData>
    >("session/classroomSessions");

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
                            </Col>
                        </Row>
                    );
                })}
        </Container>
    );
};
