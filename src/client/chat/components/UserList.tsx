import React from "react";
import { UserDataResponseType } from "../../../types";
import { Container, Row, Col } from "react-bootstrap";
import { FiAlertOctagon } from "react-icons/fi";

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
                        className="user-select"
                        onClick={() => {
                            props.setTargetUser({
                                ...user,
                                shouldClearNewMessage: hasNewMessage,
                            });
                        }}
                    >
                        <Row className="d-flex">
                            <Col className="d-flex align-items-center">
                                <img
                                    src={`/filehandler/getPfp/${user.id}`}
                                    alt="profile"
                                />
                                <p className="ml-3 text-truncate">
                                    {user.username}
                                </p>
                            </Col>
                            <Col className="d-flex flex-row-reverse align-items-center">
                                <div
                                    className={`orb ${
                                        props.onlineUsers.includes(user.id)
                                            ? "tempting-azure-gradient"
                                            : "heavy-rain-gradient"
                                    }`}
                                />
                                {hasNewMessage && (
                                    <FiAlertOctagon className="mr-2 notification" />
                                )}
                            </Col>
                        </Row>
                    </Container>
                ) : (
                    <React.Fragment key={user.id} />
                );
            })}
        </>
    );
};
