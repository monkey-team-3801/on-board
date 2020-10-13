import React from "react";
import { UserDataResponseType } from "../../../types";
import { Container } from "react-bootstrap";

type Props = {
    users: Array<UserDataResponseType>;
    myUserId: string;
    onlineUsers: Array<string>;
    setTargetUser: (
        user: UserDataResponseType & {
            shouldClearNewMessage: boolean;
        }
    ) => void;
    chatWithNewMessages: Array<string>;
};

export const UserList: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <>
            {props.users.map((user) => {
                const hasNewMessage = props.chatWithNewMessages.includes(
                    user.id
                );
                return user.id !== props.myUserId ? (
                    <Container
                        key={user.id}
                        className="d-flex align-items-center user-select"
                        onClick={() => {
                            props.setTargetUser({
                                ...user,
                                shouldClearNewMessage: hasNewMessage,
                            });
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
                        {hasNewMessage && <p>+NEW</p>}
                    </Container>
                ) : (
                    <React.Fragment key={user.id} />
                );
            })}
        </>
    );
};
