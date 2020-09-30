import { OrderedMap } from "immutable";
import React from "react";
import { Button, Modal } from "react-bootstrap";
import { v4 } from "uuid";
import { RoomEvent } from "../../../events";
import { UserDataResponseType, UserType } from "../../../types";
import { useDynamicFetch, useFetch } from "../../hooks";
import { socket } from "../../io";
import { requestIsLoaded } from "../../utils";
import "../breakoutAllocation.less";
import { BreakoutRoomAllocationContainer } from "../containers/";
import { UserData } from "../types";
import { CreateBreakoutRoomForm } from "./CreateBreakoutRoomForm";

type Props = {
    visible: boolean;
    sessionId: string;
    handleClose: () => void;
    userData: Array<Omit<UserDataResponseType, "courses">>;
};

export const BreakoutRoomModal: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { visible, handleClose, sessionId, userData } = props;

    const [createBreakoutRoomsResponse, createBreakoutRooms] = useDynamicFetch<
        { rooms: Array<string> },
        {
            rooms: Array<string>;
            sessionId: string;
        }
    >("/session/createBreakoutRooms", undefined, false);

    const [breakoutRoomResponse] = useFetch<
        { rooms: Array<{ roomId: string; users: Array<UserData> }> },
        { sessionId: string }
    >("/session/getBreakoutRooms", { sessionId });

    const [creationStage, setCreationStage] = React.useState<number>(0);

    const [roomAmount, setRoomAmount] = React.useState<number>(1);

    const [rooms, setRooms] = React.useState<
        OrderedMap<string, OrderedMap<string, UserData>>
    >(
        OrderedMap([
            [
                "main",
                OrderedMap(
                    props.userData.map((user) => {
                        return [user.id, user];
                    })
                ),
            ],
        ] as [string, OrderedMap<string, UserData>][])
    );

    const userExists = React.useCallback(
        (userId: string) => {
            return Array.from(rooms.values()).some((userMap) => {
                return userMap.has(userId);
            });
        },
        [rooms]
    );

    React.useEffect(() => {
        if (requestIsLoaded(breakoutRoomResponse)) {
            breakoutRoomResponse.data.rooms.forEach((room) => {
                // console.log(rooms);

                setRooms((prev) => {
                    let currentRoom = rooms.get(room.roomId) || OrderedMap();
                    room.users.forEach((user) => {
                        currentRoom = currentRoom?.set(user.id, {
                            ...user,
                            allocated: true,
                        });
                    });
                    return prev.set(room.roomId, currentRoom);
                });
            });
        }
    }, [breakoutRoomResponse]);

    React.useEffect(() => {
        userData.forEach((user) => {
            setRooms((prev) => {
                if (userExists(user.id)) {
                    return prev;
                }
                const mainRoom = prev.get("main")!;
                return prev.set("main", mainRoom.set(user.id, user));
            });
        });
    }, [userData, userExists]);

    React.useEffect(() => {
        if (
            requestIsLoaded(createBreakoutRoomsResponse) &&
            createBreakoutRoomsResponse.data
        ) {
            const roomIds = createBreakoutRoomsResponse.data.rooms;
            Array.from(rooms.delete("main").values()).forEach((userMap, i) => {
                socket.emit(
                    RoomEvent.BREAKOUT_ROOM_ALLOCATE,
                    Array.from(userMap.keys()),
                    roomIds[i],
                    i + 1,
                    sessionId
                );
            });
        }
    }, [createBreakoutRoomsResponse, sessionId, rooms]);

    return (
        <Modal
            show={visible}
            onHide={handleClose}
            size="xl"
            centered
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title>Breakout Rooms Management</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {creationStage === 0 && (
                    <CreateBreakoutRoomForm
                        onCreate={(amount) => {
                            setRoomAmount(amount);
                            setCreationStage(1);
                        }}
                    />
                )}
                {creationStage === 1 && (
                    <BreakoutRoomAllocationContainer
                        amount={roomAmount}
                        users={props.userData}
                        rooms={rooms}
                        setRooms={setRooms}
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                {creationStage !== 0 && (
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setCreationStage(creationStage - 1);
                        }}
                    >
                        Back
                    </Button>
                )}
                <Button
                    variant="success"
                    onClick={async () => {
                        await createBreakoutRooms({
                            rooms: Array.from(rooms.delete("main").keys()),
                            sessionId: props.sessionId,
                        });
                    }}
                >
                    Continue
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
