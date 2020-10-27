import React from "react";
import { Dropdown } from "react-bootstrap";
import { UserData } from "../types";
import { UserDisplay } from "./UserDisplay";

type Props = UserData & {
    // Method which allocates a user to a room.
    allocateUser: (
        roomId: string | "main",
        currentRoomId: string | "main",
        userId: string
    ) => void;
    // List of rooms besides this current room.
    otherRooms: Array<string>;
    // The id of the current room.
    currentRoomId: string;
};

/**
 * Component which displays users for allocation in to breakout rooms.
 */
export const UserDisplayAllocation: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div className="user-display">
            <Dropdown>
                <Dropdown.Toggle
                    variant="info"
                    size="sm"
                    className="p-1"
                    disabled={props.allocated}
                >
                    Allocate
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.otherRooms.length > 0 ? (
                        props.otherRooms.map((key, i) => {
                            if (props.currentRoomId !== key) {
                                return (
                                    <Dropdown.Item
                                        key={i}
                                        onClick={() => {
                                            props.allocateUser(
                                                key,
                                                props.currentRoomId,
                                                props.id
                                            );
                                        }}
                                    >
                                        {key === "main"
                                            ? "Main"
                                            : `Room ${i + 1}`}
                                    </Dropdown.Item>
                                );
                            }
                            return <div key={key} />;
                        })
                    ) : (
                        <p className="text-center">No rooms available</p>
                    )}
                </Dropdown.Menu>
            </Dropdown>
            <UserDisplay {...props} />
        </div>
    );
};
