import React from "react";
import { UserData } from "../types";
import { Col, Container, Row, Button } from "react-bootstrap";
import { UserDisplayAllocation } from "../components";

type Props = {
    // Breakout room id.
    roomId: string | "main";
    // List of rooms except this current one.
    otherRooms: Array<string>;
    // Index of the room.
    roomIndex: number;
    // List of users in the room.
    users: Array<UserData>;
    // Method to allocate a user to a room.
    allocateUser: (
        roomId: string | "main",
        currentRoomId: string | "main",
        userId: string
    ) => void;
    // Method to delete a single room.
    deleteRoom?: (roomId: string) => void;
    // Minimum bootstrap column size.
    minColSize?: number;
};

/**
 * Container displaying breakout rooms and the users associated with it.
 */
export const RoomGroupingContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Row>
            <Container fluid className="room-group-header">
                <Row>
                    <Col xs={6} className="d-flex align-items-center">
                        <h5 className="m-0">
                            {props.roomId === "main"
                                ? "Main Room"
                                : `Room ${props.roomIndex + 1}`}
                        </h5>
                    </Col>

                    {props.roomId !== "main" && (
                        <>
                            <Col xs={3}>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        props.deleteRoom?.(props.roomId);
                                    }}
                                >
                                    Delete
                                </Button>
                            </Col>
                            <Col xs={3}>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => {
                                        props.deleteRoom?.(props.roomId);
                                    }}
                                >
                                    Join
                                </Button>
                            </Col>
                        </>
                    )}

                    {props.roomId === "main" && (
                        <>
                            <Col xs={3}>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        // TODO
                                    }}
                                >
                                    Auto
                                </Button>
                            </Col>
                            <Col xs={3}>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        // TODO
                                    }}
                                >
                                    Reset
                                </Button>
                            </Col>
                        </>
                    )}
                </Row>
            </Container>
            <Container className="room-group">
                <Row>
                    {props.users.map((user) => {
                        return (
                            <Col xs={props.minColSize ?? 2} key={user.id}>
                                <UserDisplayAllocation
                                    {...user}
                                    currentRoomId={props.roomId}
                                    allocateUser={props.allocateUser}
                                    otherRooms={props.otherRooms}
                                />
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </Row>
    );
};
