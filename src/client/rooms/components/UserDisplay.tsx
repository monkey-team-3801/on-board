import React from "react";
import { Dropdown } from "react-bootstrap";
import { UserData } from "../types";

type Props = UserData & {
    allocateUser: (
        roomId: string | "main",
        currentRoomId: string | "main",
        userId: string
    ) => void;
    otherRooms: Array<string>;
    currentRoomId: string;
};

export const UserDisplay: React.FunctionComponent<Props> = (props: Props) => {
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
                        return <></>;
                    })}
                </Dropdown.Menu>
            </Dropdown>
            <img src={`/filehandler/getPfp/${props.id}`} alt="profile" />
            <div className="username">
                <p className="text-truncate">{props.username}</p>
            </div>
        </div>
    );
};
