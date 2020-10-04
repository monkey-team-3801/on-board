import React from "react";
import { Container, Row, Button, Col } from "react-bootstrap";

import { SessionInfo, ClassroomSessionData } from "../../types";
import { useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const PrivateRoomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;

    const [privateRoomResponse, getPrivateRooms] = useFetch<Array<SessionInfo>>(
        "session/privateSessions"
    );

    React.useEffect(() => {
        if (requestIsLoaded(privateRoomResponse)) {
            setLoading(false);
        }
    }, [privateRoomResponse, setLoading]);

    return (
        <Container>
            {privateRoomResponse.data &&
                privateRoomResponse.data.map((session, i) => {
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
