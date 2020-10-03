import React from "react";
import { Dropdown } from "react-bootstrap";
import { UserData } from "../types";
import { UserDisplay } from "./UserDisplay";

type Props = UserData & {
    allocateUser: (
        roomId: string | "main",
        currentRoomId: string | "main",
        userId: string
    ) => void;
    otherRooms: Array<string>;
    currentRoomId: string;
};

export const UserDisplayAllocation: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <div className="user-display">
            <Dropdown>
                <Dropdown.Toggle
                    variant="info"
                    size="sm"
                    disabled={props.allocated}
                >
                    Allocate
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.otherRooms.map((key, i) => {
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
                                    {key === "main" ? "Main" : `Room ${i + 1}`}
                                </Dropdown.Item>
                            );
                        }
                        return <div key={key} />;
                    })}
                </Dropdown.Menu>
            </Dropdown>
            <UserDisplay {...props} />
        </div>
    );
};
