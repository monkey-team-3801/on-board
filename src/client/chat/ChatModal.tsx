import React from "react";
import { Modal, Container, Row, Col } from "react-bootstrap";
import { ChatModalStatusContext } from "../context";
import { ChatModalStatusType } from "../types";
import { useFetch } from "../hooks";
import { UserDataResponseType, UserType } from "../../types";
import { requestIsLoaded } from "../utils";
import { ChatSession } from "./ChatSession";
import { UserList } from "./components";
import { socket } from "../io";
import { RoomEvent, GlobalEvent } from "../../events";
import { useDebounce, useDebouncedCallback } from "use-debounce/lib";

type Props = ChatModalStatusType & {
    myUserId: string;
    myUsername: string;
    chatWithNewMessages: Array<string>;
};

export const ChatModal: React.FunctionComponent<Props> = (props: Props) => {
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

    const x = () => {
        debouncedFetchOnlineUsers.callback();
    };

    React.useEffect(() => {
        fetchOnlineUsers();
        if (props.open) {
            socket.on(GlobalEvent.USER_ONLINE_STATUS_CHANGE, x);
        } else {
            socket.off(GlobalEvent.USER_ONLINE_STATUS_CHANGE, x);
        }
    }, [props.open]);

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
    }, [props.chatWithNewMessages]);

    return (
        <Modal
            show={props.open}
            onHide={modalContext.onClose}
            size="xl"
            centered
            scrollable
            className="chat-modal"
        >
            <Modal.Body>
                <Container>
                    <Row>
                        <Col lg="4">
                            <Row>
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
                            <Row>
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
                            <Row>
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
