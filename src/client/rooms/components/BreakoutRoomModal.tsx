import React from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import { CreateBreakoutRoomForm } from "./CreateBreakoutRoomForm";
import { useDynamicFetch } from "../../hooks";
import { BreakoutRoomAllocationContainer } from "../containers/";
import { UserDataResponseType, UserType } from "../../../types";

import "../breakoutAllocation.less";
import { socket } from "../../io";
import { List, OrderedMap } from "immutable";
import { UserData } from "../types";
import { requestIsLoaded } from "../../utils";
import { RoomEvent } from "../../../events";

type Props = {
    visible: boolean;
    sessionId: string;
    handleClose: () => void;
    userData: Array<Omit<UserDataResponseType, "courses">>;
};

export const BreakoutRoomModal: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { visible, handleClose, sessionId } = props;

    const [createBreakoutRoomsResponse, createBreakoutRooms] = useDynamicFetch<
        { rooms: Array<string> },
        {
            amount: number;
            sessionId: string;
        }
    >("/session/createBreakoutRooms", undefined, false);

    const [creationStage, setCreationStage] = React.useState<number>(0);

    const [roomAmount, setRoomAmount] = React.useState<number>(1);

    const roomsRef = React.useRef<List<OrderedMap<string, UserData>>>(List([]));

    const setRooms = (rooms: List<OrderedMap<string, UserData>>) => {
        roomsRef.current = rooms;
    };

    React.useEffect(() => {
        if (
            requestIsLoaded(createBreakoutRoomsResponse) &&
            createBreakoutRoomsResponse.data
        ) {
            const rooms = createBreakoutRoomsResponse.data.rooms;
            roomsRef.current.shift().forEach((userMap, i) => {
                socket.emit(
                    RoomEvent.BREAKOUT_ROOM_ALLOCATE,
                    Array.from(userMap.keys()),
                    rooms[i],
                    i + 1,
                    sessionId
                );
            });
        }
    }, [createBreakoutRoomsResponse, sessionId]);

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
                        users={props.userData.concat(
                            Array.from({ length: 10 }).map((_, i) => {
                                return {
                                    id: i.toString(),
                                    username: "user " + i,
                                    userType: UserType.STUDENT,
                                };
                            })
                        )}
                        setParentRooms={setRooms}
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
                            amount: roomAmount,
                            sessionId: props.sessionId,
                        });

                        //     userRoomMap: roomsRef.current
                        //         .shift()
                        //         .map((room) => {
                        //             return Array.from(room.values()).map(
                        //                 (user) => {
                        //                     return user.id;
                        //                 }
                        //             );
                        //         })
                        //         .toArray(),
                        // }
                        // roomsRef.current.shift().forEach((roomMap) => {
                        //     console.log(roomMap.toJSON());
                        // });
                        // socket.emit("");
                    }}
                >
                    Continue
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
