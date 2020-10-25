import React from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";
import { Loader } from "../../components";
import { useDynamicFetch } from "../../hooks";
import { requestIsLoaded } from "../../utils";
import "../breakoutAllocation.less";
import { UserData } from "../types";
import { UserDisplay } from "./UserDisplay";

type Props = RouteComponentProps & {
    visible: boolean;
    sessionId: string;
    handleClose: () => void;
};

export const BreakoutRoomListModal: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { visible, handleClose, sessionId } = props;
    const [breakoutRoomResponse, fetchBreakoutRoomData] = useDynamicFetch<
        { rooms: Array<{ roomId: string; users: Array<UserData> }> },
        { sessionId: string }
    >("/session/getBreakoutRooms", { sessionId }, false);

    React.useEffect(() => {
        if (visible) {
            fetchBreakoutRoomData({ sessionId });
        }
    }, [visible, fetchBreakoutRoomData, sessionId]);

    return (
        <Modal
            show={visible}
            onHide={handleClose}
            size="xl"
            centered
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title>Breakout Rooms</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {requestIsLoaded(breakoutRoomResponse) ? (
                    <Container fluid>
                        {breakoutRoomResponse.data.rooms.map((room, index) => {
                            return (
                                <Container className="mt-4" key={room.roomId}>
                                    <Row>
                                        <h4 className="text-justify">
                                            Room {index + 1}
                                        </h4>
                                        <Button
                                            size="sm"
                                            variant="success"
                                            className="ml-4"
                                            onClick={() => {
                                                props.history.push(
                                                    `/breakout/${room.roomId}`
                                                );
                                            }}
                                        >
                                            Join
                                        </Button>
                                    </Row>
                                    <Row className="mt-2">
                                        {room.users.length === 0 ? (
                                            <p className="text-muted">
                                                This room has no users
                                            </p>
                                        ) : (
                                            room.users.map((user) => {
                                                return (
                                                    <Col xs="1" key={user.id}>
                                                        <UserDisplay
                                                            {...user}
                                                        />
                                                    </Col>
                                                );
                                            })
                                        )}
                                    </Row>
                                </Container>
                            );
                        })}
                    </Container>
                ) : (
                    <Loader />
                )}
            </Modal.Body>
            <Modal.Footer></Modal.Footer>
        </Modal>
    );
};
