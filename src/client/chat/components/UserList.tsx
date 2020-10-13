import React from "react";
import { UserDataResponseType } from "../../../types";
import { Container } from "react-bootstrap";

type Props = {
    users: Array<UserDataResponseType>;
    myUserId: string;
    onlineUsers: Array<string>;
    setTargetUser: (user: UserDataResponseType) => void;
};

export const UserList: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <>
            {props.users.map((user) => {
                return user.id !== props.myUserId ? (
                    <Container
                        key={user.id}
                        className="d-flex align-items-center user-select"
                        onClick={() => {
                            props.setTargetUser(user);
                        }}
                    >
                        <div
                            className={`mr-3 orb ${
                                props.onlineUsers.includes(user.id)
                                    ? "tempting-azure-gradient"
                                    : "heavy-rain-gradient"
                            }`}
                        />
                        <p>{user.username}</p>
                    </Container>
                ) : (
                    <React.Fragment key={user.id} />
                );
            })}
        </>
    );
};
