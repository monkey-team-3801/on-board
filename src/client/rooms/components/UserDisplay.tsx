import React from "react";
import { UserDataResponseType } from "../../../types";
import { Button, Dropdown } from "react-bootstrap";

type Props = Omit<UserDataResponseType, "courses"> & {
    allocateUser: (
        roomIndex: number,
        currentRoomIndex: number,
        userId: string
    ) => void;
    currentRoomIndex: number;
    roomAmount: number;
};

export const UserDisplay: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <div className="user-display">
            <Dropdown>
                <Dropdown.Toggle variant="info" size="sm">
                    Allocate
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {Array.from({ length: props.roomAmount + 1 }).map(
                        (_, i) => {
                            if (props.currentRoomIndex !== i) {
                                return (
                                    <Dropdown.Item
                                        onClick={() => {
                                            props.allocateUser(
                                                i,
                                                props.currentRoomIndex,
                                                props.id
                                            );
                                        }}
                                    >
                                        {i === 0 ? "Main" : `Room ${i}`}
                                    </Dropdown.Item>
                                );
                            }
                            return <></>;
                        }
                    )}
                </Dropdown.Menu>
            </Dropdown>
            <img src={`/filehandler/getPfp/${props.id}`} />
            <div className="username">
                <p>{props.username}</p>
            </div>
        </div>
    );
};
