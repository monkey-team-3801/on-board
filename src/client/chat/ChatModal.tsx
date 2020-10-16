import React from "react";
import { Col, Container, Modal, Row, Form } from "react-bootstrap";
import { useDebouncedCallback } from "use-debounce/lib";
import { GlobalEvent } from "../../events";
import { UserDataResponseType, UserType } from "../../types";
import { ChatModalStatusContext } from "../context";
import { useFetch } from "../hooks";
import { socket } from "../io";
import { ChatModalStatusType } from "../types";
import { ChatSession } from "./ChatSession";
import { UserList } from "./components";
import Select from "react-select";

type Props = ChatModalStatusType & {
    myUserId: string;
    myUsername: string;
    chatWithNewMessages: Array<string>;
    courses: Array<string>;
};

export const ChatModal: React.FunctionComponent<Props> = (props: Props) => {
    const { open: modalOpen } = props;
    const modalContext = React.useContext(ChatModalStatusContext);

    const [userResponse] = useFetch<Array<UserDataResponseType>>(
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

    const [userFilter, setUserFilter] = React.useState<string>("");
    const [courseFilter, setCourseFilter] = React.useState<string>("");

    const filteredUsers = React.useMemo(() => {
        return userResponse.data?.filter((user) => {
            return (
                user.username.toLowerCase().includes(userFilter) &&
                (courseFilter === "" || user.courses.includes(courseFilter))
            );
        });
    }, [userFilter, courseFilter, userResponse]);

    const coordinators = React.useMemo(() => {
        return filteredUsers?.filter((user) => {
            return user.userType === UserType.COORDINATOR;
        });
    }, [filteredUsers]);

    const tutors = React.useMemo(() => {
        return filteredUsers?.filter((user) => {
            return user.userType === UserType.TUTOR;
        });
    }, [filteredUsers]);

    const students = React.useMemo(() => {
        return filteredUsers?.filter((user) => {
            return user.userType === UserType.STUDENT;
        });
    }, [filteredUsers]);

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
                            <Row>
                                <Container>
                                    <Form.Label>Search user</Form.Label>
                                    <Form.Control
                                        className="mb-3"
                                        type="text"
                                        placeholder="Search users..."
                                        onChange={(e) => {
                                            setUserFilter(e.target.value);
                                        }}
                                    />
                                    <Form.Label>Filter courses</Form.Label>
                                    <Select
                                        className="mb-3"
                                        placeholder="Filter course..."
                                        options={props.courses?.map((code) => {
                                            return { value: code, label: code };
                                        })}
                                        isClearable
                                        onChange={(value) => {
                                            setCourseFilter(
                                                ((value as unknown) as {
                                                    value: string;
                                                } | null)?.value ?? ""
                                            );
                                        }}
                                    />
                                </Container>
                            </Row>
                            {filteredUsers?.length === 0 && (
                                <p className="text-muted">No results...</p>
                            )}
                            <Row className="mt-2">
                                <UserList
                                    users={coordinators || []}
                                    targetUserId={targetUser?.id}
                                    myUserId={props.myUserId}
                                    onlineUsers={onlineUserResponse.data || []}
                                    setTargetUser={setTargetUser}
                                    chatWithNewMessages={
                                        props.chatWithNewMessages
                                    }
                                    headerText="Coordinators"
                                />
                            </Row>
                            <Row className="mt-4">
                                <UserList
                                    users={tutors || []}
                                    targetUserId={targetUser?.id}
                                    myUserId={props.myUserId}
                                    onlineUsers={onlineUserResponse.data || []}
                                    setTargetUser={setTargetUser}
                                    chatWithNewMessages={
                                        props.chatWithNewMessages
                                    }
                                    headerText="Tutors"
                                />
                            </Row>
                            <Row className="mt-4">
                                <UserList
                                    users={students || []}
                                    targetUserId={targetUser?.id}
                                    myUserId={props.myUserId}
                                    onlineUsers={onlineUserResponse.data || []}
                                    setTargetUser={setTargetUser}
                                    chatWithNewMessages={
                                        props.chatWithNewMessages
                                    }
                                    headerText="Students"
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
