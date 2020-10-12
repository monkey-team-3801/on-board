import React from "react";
import { Modal, Container, Row, Col } from "react-bootstrap";
import { ChatModalStatusContext } from "../context";
import { ChatModalStatusType } from "../types";
import { useFetch } from "../hooks";
import { UserDataResponseType, UserType } from "../../types";
import { requestIsLoaded } from "../utils";
import { ChatSession } from "./ChatSession";

type Props = ChatModalStatusType & {
    myUserId: string;
    myUsername: string;
};

export const ChatModal: React.FunctionComponent<Props> = (props: Props) => {
    const modalContext = React.useContext(ChatModalStatusContext);

    const [userResponse, fetchUsers] = useFetch<Array<UserDataResponseType>>(
        "/user/getAllUserInCourse"
    );

    const [targetUser, setTargetUser] = React.useState<
        UserDataResponseType | undefined
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

    return (
        <Modal
            show={props.open}
            onHide={modalContext.onClose}
            size="xl"
            centered
            scrollable
        >
            <Modal.Body>
                <Container>
                    <Row>
                        <Col lg="4">
                            <Row>
                                <h1>Coordinators</h1>
                                {coordinators &&
                                    coordinators.map((user) => {
                                        return user.id !== props.myUserId ? (
                                            <Container key={user.id}>
                                                <p
                                                    onClick={() => {
                                                        setTargetUser(user);
                                                    }}
                                                >
                                                    {user.username}
                                                </p>
                                            </Container>
                                        ) : (
                                            <React.Fragment key={user.id} />
                                        );
                                    })}
                            </Row>
                            <Row>
                                <h1>Tutors</h1>
                                {tutors &&
                                    tutors.map((user) => {
                                        return user.id !== props.myUserId ? (
                                            <Container key={user.id}>
                                                <p
                                                    onClick={() => {
                                                        setTargetUser(user);
                                                    }}
                                                >
                                                    {user.username}
                                                </p>
                                            </Container>
                                        ) : (
                                            <React.Fragment key={user.id} />
                                        );
                                    })}
                            </Row>
                            <Row>
                                <h1>Students</h1>
                                {students &&
                                    students.map((user) => {
                                        return user.id !== props.myUserId ? (
                                            <Container key={user.id}>
                                                <p
                                                    onClick={() => {
                                                        setTargetUser(user);
                                                    }}
                                                >
                                                    {user.username}
                                                </p>
                                            </Container>
                                        ) : (
                                            <React.Fragment key={user.id} />
                                        );
                                    })}
                            </Row>
                        </Col>
                        <Col lg="8">
                            {targetUser && (
                                <ChatSession
                                    targetUserData={targetUser}
                                    myUserId={props.myUserId}
                                    myUsername={props.myUsername}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>
    );
};
