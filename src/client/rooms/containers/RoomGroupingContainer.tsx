import React from "react";
import { UserData } from "../types";
import { Col, Container, Row } from "react-bootstrap";
import { UserDisplay } from "../components";

type Props = {
    roomIndex: number;
    roomAmount: number;
    users: Array<UserData>;
    allocateUser: (
        roomIndex: number,
        currentRoomIndex: number,
        userId: string
    ) => void;
    minColSize?: number;
};

export const RoomGroupingContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Row>
            <h5>
                {props.roomIndex === 0
                    ? "Main Room"
                    : `Room ${props.roomIndex}`}
            </h5>
            <Container className="room-group">
                <Row>
                    {props.users.map((user) => {
                        return (
                            <Col xs={props.minColSize ?? 2} key={user.id}>
                                <UserDisplay
                                    {...user}
                                    currentRoomIndex={props.roomIndex}
                                    roomAmount={props.roomAmount}
                                    allocateUser={props.allocateUser}
                                />
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </Row>
    );
};
