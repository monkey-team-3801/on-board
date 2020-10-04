import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { SessionDeleteRequestType, SessionInfo } from "../../types";
import { useDynamicFetch, useFetch } from "../hooks";
import { requestIsLoaded } from "../utils";

type Props = RouteComponentProps & {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const PrivateRoomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, history } = props;

    const [privateRoomResponse, getPrivateRooms] = useFetch<Array<SessionInfo>>(
        "session/privateSessions"
    );

    const [, deleteRoom] = useDynamicFetch<undefined, SessionDeleteRequestType>(
        "session/delete/privateRoom",
        undefined,
        false
    );

    const onRoomJoinClick = React.useCallback(
        (id: string) => {
            history.push(`/room/${id}`);
        },
        [history]
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
                                        await getPrivateRooms();
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
