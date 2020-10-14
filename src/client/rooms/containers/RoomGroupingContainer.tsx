import React from "react";
import { UserData } from "../types";
import { Col, Container, Row, Button } from "react-bootstrap";
import { UserDisplayAllocation } from "../components";

type Props = {
    roomId: string | "main";
    otherRooms: Array<string>;
    roomIndex: number;
    users: Array<UserData>;
    allocateUser: (
        roomId: string | "main",
        currentRoomId: string | "main",
        userId: string
    ) => void;
    deleteRoom?: (roomId: string) => void;
    minColSize?: number;
};

export const RoomGroupingContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Row>
            <Container fluid className="room-group-header">
                <Row>
                    <Col xs={9} className="d-flex align-items-center">
                        <h5 className="m-0">
                            {props.roomId === "main"
                                ? "Main Room"
                                : `Room ${props.roomIndex + 1}`}
                        </h5>
                    </Col>
                    <Col xs={3}>
                        {props.roomId !== "main" && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    props.deleteRoom?.(props.roomId);
                                }}
                            >
                                Delete
                            </Button>
                        )}
                    </Col>
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
