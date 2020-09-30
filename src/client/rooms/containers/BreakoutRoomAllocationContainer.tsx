import React from "react";
import { Container, Col, Row, Button } from "react-bootstrap";
import { UserDataResponseType } from "../../../types";
import { UserDisplay } from "../components";
import { OrderedMap, List } from "immutable";
import { UserData } from "../types";
import { RoomGroupingContainer } from "./RoomGroupingContainer";

type Props = {
    amount: number;
    users: Array<UserData>;
    setParentRooms: (rooms: List<OrderedMap<string, UserData>>) => void;
};

export const BreakoutRoomAllocationContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setParentRooms } = props;
    const [rooms, setRooms] = React.useState<
        List<OrderedMap<string, UserData>>
    >(
        List([
            OrderedMap(
                props.users.map((user) => {
                    return [user.id, user];
                })
            ),
            ...Array.from({ length: props.amount }).map(() => {
                return OrderedMap<string, UserData>();
            }),
        ])
    );

    const allocateUser = React.useCallback(
        (roomIndex: number, currentRoomIndex: number, userId: string) => {
            setRooms((prev) => {
                const currentRoom = prev.get(currentRoomIndex)!;
                const newRoom = prev.get(roomIndex)!;
                const userData = currentRoom.get(userId)!;
                return prev
                    .set(currentRoomIndex, currentRoom.delete(userId))
                    .set(roomIndex, newRoom.set(userId, userData));
            });
        },
        []
    );

    React.useEffect(() => {
        setParentRooms(rooms);
    }, [rooms, setParentRooms]);

    return (
        <Container className="allocation">
            <Row>
                <Col lg={6}>
                    <Container fluid>
                        {rooms.shift()?.map((_, i) => {
                            return (
                                <Row>
                                    <Container key={i} fluid>
                                        <RoomGroupingContainer
                                            roomIndex={i + 1}
                                            roomAmount={props.amount}
                                            users={Array.from(
                                                rooms.get(i + 1)?.values() || []
                                            )}
                                            allocateUser={allocateUser}
                                        />
                                    </Container>
                                </Row>
                            );
                        })}
                    </Container>
                </Col>
                <Col lg={6}>
                    <Container fluid>
                        <RoomGroupingContainer
                            roomIndex={0}
                            roomAmount={props.amount}
                            users={Array.from(rooms.get(0)?.values() || [])}
                            allocateUser={allocateUser}
                        />
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};
