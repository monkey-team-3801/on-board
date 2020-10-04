import React from "react";
import { Container, Row, Button, Col } from "react-bootstrap";

import { SessionInfo, ClassroomSessionData } from "../../types";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ClassroomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;

    const [classroomsResponse, getClassrooms] = useFetch<
        Array<ClassroomSessionData>
    >("session/classroomSessions");

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
                                    onClick={async () => {
                                        //await props.onJoinClick(session.id);
                                    }}
                                >
                                    Join
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={async () => {
                                        //await props.onDeleteClick(session.id);
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
