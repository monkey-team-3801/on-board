import React from "react";
import { UserDataResponseType } from "../../../types";
import { Container, Row, Col } from "react-bootstrap";
import { FiAlertOctagon } from "react-icons/fi";
import { ProfilePicture } from "../../components";

type Props = {
    users: Array<UserDataResponseType>;
    myUserId: string;
    targetUserId?: string;
    onlineUsers: Array<string>;
    setTargetUser: (
        user: UserDataResponseType & {
            shouldClearNewMessage: boolean;
        }
    ) => void;
    chatWithNewMessages: Array<string>;
    headerText?: string;
};

export const UserList: React.FunctionComponent<Props> = (props: Props) => {
    if (props.users.length === 0) {
        return <></>;
    }

    return (
        <>
            <h1>{props.headerText}</h1>
            {props.users.map((user) => {
                const hasNewMessage = props.chatWithNewMessages.includes(
                    user.id
                );
                return user.id !== props.myUserId ? (
                    <Container
                        key={user.id}
                        className={`user-select ${
                            props.targetUserId === user.id ? "selected" : ""
                        }`}
                        onClick={() => {
                            props.setTargetUser({
                                ...user,
                                shouldClearNewMessage: hasNewMessage,
                            });
                        }}
                    >
                        <Row className="d-flex">
                            <Col className="d-flex align-items-center">
                                <ProfilePicture id={user.id} />
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
