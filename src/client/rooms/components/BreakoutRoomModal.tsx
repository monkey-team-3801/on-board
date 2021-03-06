import { OrderedMap } from "immutable";
import React from "react";
import { Alert, Modal } from "react-bootstrap";
import { RoomEvent } from "../../../events";
import { UserDataResponseType } from "../../../types";
import { ButtonWithLoadingProp, Loader } from "../../components";
import { useDynamicFetch } from "../../hooks";
import { socket } from "../../io";
import { requestIsLoaded, requestIsLoading } from "../../utils";
import "../breakoutAllocation.less";
import { BreakoutRoomAllocationContainer } from "../containers/";
import { UserData } from "../types";

type Props = {
    // Modal visiblity status.
    visible: boolean;
    // Current session id.
    sessionId: string;
    // Method to close the modal.
    handleClose: () => void;
    // Array of users currently in the session.
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

    const [breakoutRoomResponse, fetchBreakoutRoomData] = useDynamicFetch<
        { rooms: Array<{ roomId: string; users: Array<UserData> }> },
        { sessionId: string }
    >("/session/getBreakoutRooms", { sessionId });

    const [allocationComplete, setAllocationComplete] = React.useState<boolean>(
        false
    );

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
                setRooms((prev) => {
                    let currentRoom = rooms.get(room.roomId) || OrderedMap();
                    room.users.forEach((user) => {
                        currentRoom = currentRoom?.set(user.id, {
                            ...user,
                            allocated: true,
                        });
                    });
                    return prev
                        .map((mapping) => {
                            return mapping.deleteAll(
                                room.users.map((user) => {
                                    return user.id;
                                })
                            );
                        })
                        .set(room.roomId, currentRoom);
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [breakoutRoomResponse]);

    React.useEffect(() => {
        if (visible) {
            setRooms((prev) => {
                return prev.map((mapping) => {
                    return mapping.clear();
                });
            });
            fetchBreakoutRoomData({ sessionId });
            setAllocationComplete(false);
        }
    }, [visible, fetchBreakoutRoomData, sessionId]);

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
            backdrop={allocationComplete ? "static" : true}
        >
            <Modal.Header closeButton>
                <Modal.Title>Breakout Rooms Management</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!requestIsLoading(createBreakoutRoomsResponse) ? (
                    <>
                        {!allocationComplete ? (
                            <BreakoutRoomAllocationContainer
                                sessionId={props.sessionId}
                                users={props.userData}
                                rooms={rooms}
                                setRooms={setRooms}
                            />
                        ) : (
                            <Alert variant="success">Allocation success</Alert>
                        )}
                    </>
                ) : (
                    <Loader className="pt-4 pb-4" />
                )}
            </Modal.Body>
            <Modal.Footer>
                <ButtonWithLoadingProp
                    disabled={
                        requestIsLoading(createBreakoutRoomsResponse) ||
                        allocationComplete ||
                        rooms.size === 1
                    }
                    loading={requestIsLoading(createBreakoutRoomsResponse)}
                    invertLoader
                    onClick={async () => {
                        await createBreakoutRooms({
                            rooms: Array.from(rooms.delete("main").keys()),
                            sessionId: props.sessionId,
                        });
                        setAllocationComplete(true);
                        setTimeout(() => {
                            handleClose();
                        }, 1000);
                    }}
                >
                    Allocate
                </ButtonWithLoadingProp>
            </Modal.Footer>
        </Modal>
    );
};
