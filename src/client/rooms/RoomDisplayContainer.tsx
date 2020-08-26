import React from "react";
import { Container, Row, Button, Col } from "react-bootstrap";

import { SessionInfo } from "../../types";

type Props = {
    data: Array<SessionInfo>;
    onDeleteClick: (id: string) => Promise<void>;
    onJoinClick: (id: string) => void;
};

export const RoomDisplayContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container>
            {props.data.map((session, i) => {
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
                                    await props.onJoinClick(session.id);
                                }}
                            >
                                Join
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={async () => {
                                    await props.onDeleteClick(session.id);
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
