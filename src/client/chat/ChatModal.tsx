import React from "react";
import { Col, Container, Modal, Row } from "react-bootstrap";
import { useDebouncedCallback } from "use-debounce/lib";
import { GlobalEvent } from "../../events";
import { UserDataResponseType, UserType } from "../../types";
import { ChatModalStatusContext } from "../context";
import { useFetch } from "../hooks";
import { socket } from "../io";
import { ChatModalStatusType } from "../types";
import { ChatSession } from "./ChatSession";
import { UserList } from "./components";

type Props = ChatModalStatusType & {
    myUserId: string;
    myUsername: string;
    chatWithNewMessages: Array<string>;
};

export const ChatModal: React.FunctionComponent<Props> = (props: Props) => {
    const { open: modalOpen } = props;
    const modalContext = React.useContext(ChatModalStatusContext);

    const [userResponse, fetchUsers] = useFetch<Array<UserDataResponseType>>(
        "/user/getAllUserInCourse"
    );

    const [onlineUserResponse, fetchOnlineUsers] = useFetch<Array<string>>(
        "/user/online"
    );

    const [targetUser, setTargetUser] = React.useState<
        | (UserDataResponseType & {
              shouldClearNewMessage: boolean;
          })
        | undefined
    >();

    const coordinators = React.useMemo(() => {
        return userResponse.data?.filter((user) => {
            return user.userType === UserType.COORDINATOR;
        });
    }, [userResponse]);

    const tutors = React.useMemo(() => {
        return userResponse.data?.filter((user) => {
            return user.userType === UserType.TUTOR;
        });
    }, [userResponse]);

    const students = React.useMemo(() => {
        return userResponse.data?.filter((user) => {
            return user.userType === UserType.STUDENT;
        });
    }, [userResponse]);

    const debouncedFetchOnlineUsers = useDebouncedCallback(
        fetchOnlineUsers,
        1000
    );

    React.useEffect(() => {
        fetchOnlineUsers();
        if (modalOpen) {
            socket.on(
                GlobalEvent.USER_ONLINE_STATUS_CHANGE,
                debouncedFetchOnlineUsers.callback
            );
        } else {
            socket.off(
                GlobalEvent.USER_ONLINE_STATUS_CHANGE,
                debouncedFetchOnlineUsers.callback
            );
        }
    }, [modalOpen, debouncedFetchOnlineUsers, fetchOnlineUsers]);

    React.useEffect(() => {
        if (targetUser && props.chatWithNewMessages.includes(targetUser.id)) {
            setTargetUser((user) => {
                return user
                    ? {
                          ...user,
                          shouldClearNewMessage: true,
                      }
                    : undefined;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.chatWithNewMessages]);

    return (
        <Modal
            show={modalOpen}
            onHide={modalContext.onClose}
            size="xl"
            centered
            scrollable
            className="chat-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Messages</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row>
                        <Col lg="4" className="user-list-container">
                            <Row className="mt-2">
                                <h1>Coordinators</h1>
                                <UserList
                                    users={coordinators || []}
                                    myUserId={props.myUserId}
                                    onlineUsers={onlineUserResponse.data || []}
                                    setTargetUser={setTargetUser}
                                    chatWithNewMessages={
                                        props.chatWithNewMessages
                                    }
                                />
                            </Row>
                            <Row className="mt-4">
                                <h1>Tutors</h1>
                                <UserList
                                    users={tutors || []}
                                    myUserId={props.myUserId}
                                    onlineUsers={onlineUserResponse.data || []}
                                    setTargetUser={setTargetUser}
                                    chatWithNewMessages={
                                        props.chatWithNewMessages
                                    }
                                />
                            </Row>
                            <Row className="mt-4">
                                <h1>Students</h1>
                                <UserList
                                    users={students || []}
                                    myUserId={props.myUserId}
                                    onlineUsers={onlineUserResponse.data || []}
                                    setTargetUser={setTargetUser}
                                    chatWithNewMessages={
                                        props.chatWithNewMessages
                                    }
                                />
                            </Row>
                        </Col>
                        <Col lg="8">
                            {targetUser && (
                                <ChatSession
                                    targetUserData={targetUser}
                                    myUserId={props.myUserId}
                                    myUsername={props.myUsername}
                                    onNewMessageClear={() => {
                                        setTargetUser((user) => {
                                            return user
                                                ? {
                                                      ...user,
                                                      shouldClearNewMessage: false,
                                                  }
                                                : undefined;
                                        });
                                    }}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>
    );
};
