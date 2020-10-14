import { OrderedMap } from "immutable";
import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { v4 } from "uuid";
import { UserData } from "../types";
import { RoomGroupingContainer } from "./RoomGroupingContainer";
import { useDynamicFetch } from "../../hooks";
import { ButtonWithLoadingProp } from "../../components";
import { requestIsLoading } from "../../utils";

type Props = {
    sessionId: string;
    users: Array<UserData>;
    rooms: OrderedMap<string, OrderedMap<string, UserData>>;
    setRooms: React.Dispatch<
        React.SetStateAction<OrderedMap<string, OrderedMap<string, UserData>>>
    >;
};

export const BreakoutRoomAllocationContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { rooms, setRooms } = props;

    const [, deleteBreakoutRoom] = useDynamicFetch<
        undefined,
        { sessionId: string }
    >("/session/deleteBreakoutRoom", undefined, false);

    const [
        deleteAllBreakoutRoomResponse,
        deleteAllBreakoutRooms,
    ] = useDynamicFetch<undefined, { sessionId: string }>(
        "/session/deleteAllBreakoutRooms",
        undefined,
        false
    );

    const allocateUser = React.useCallback(
        (
            roomId: string | "main",
            currentRoomId: string | "main",
            userId: string
        ) => {
            setRooms((prev) => {
                const currentRoom = prev.get(currentRoomId)!;
                const newRoom = prev.get(roomId)!;
                const userData = currentRoom.get(userId)!;
                return prev
                    .set(currentRoomId, currentRoom.delete(userId))
                    .set(roomId, newRoom.set(userId, userData));
            });
        },
        [setRooms]
    );

    const deleteRoom = React.useCallback(
        (roomId: string) => {
            setRooms((prev) => {
                return prev.delete(roomId);
            });
            deleteBreakoutRoom({
                sessionId: roomId,
            });
        },
        [setRooms, deleteBreakoutRoom]
    );

    return (
        <Container className="allocation">
            <Row className="header-row">
                <Button
                    variant="success"
                    size="sm"
                    disabled={requestIsLoading(deleteAllBreakoutRoomResponse)}
                    onClick={() => {
                        setRooms(rooms.set(v4(), OrderedMap()));
                    }}
                >
                    Add Room
                </Button>
                <ButtonWithLoadingProp
                    variant="danger"
                    size="sm"
                    className="ml-2"
                    loading={requestIsLoading(deleteAllBreakoutRoomResponse)}
                    invertLoader
                    onClick={async () => {
                        await deleteAllBreakoutRooms({
                            sessionId: props.sessionId,
                        });
                        props.setRooms((rooms) => {
                            return rooms
                                .clear()
                                .set("main", rooms.get("main")!);
                        });
                    }}
                >
                    Delete All Rooms
                </ButtonWithLoadingProp>
            </Row>
            <Row>
                <Col lg={6}>
                    <Container fluid>
                        {Array.from(rooms.delete("main").entries() || []).map(
                            ([key, room], i) => {
                                return (
                                    <Row key={key}>
                                        <Container
                                            key={key}
                                            fluid
                                            className="room-group-container"
                                        >
                                            <RoomGroupingContainer
                                                roomId={key}
                                                otherRooms={Array.from(
                                                    rooms.delete(key).keys()
                                                )}
                                                roomIndex={i}
                                                users={Array.from(
                                                    room.values()
                                                )}
                                                allocateUser={allocateUser}
                                                deleteRoom={deleteRoom}
                                            />
                                        </Container>
                                    </Row>
                                );
                            }
                        )}
                    </Container>
                </Col>
                <Col lg={6}>
                    <Container fluid>
                        <RoomGroupingContainer
                            roomId={"main"}
                            otherRooms={Array.from(rooms.delete("main").keys())}
                            roomIndex={0}
                            users={Array.from(
                                rooms.get("main")?.values() || []
                            )}
                            allocateUser={allocateUser}
                        />
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};
