import React from "react";
import { Modal, Container, Row, Col } from "react-bootstrap";
import { ChatModalStatusContext } from "../context";
import { ChatModalStatusType } from "../types";
import { useFetch } from "../hooks";
import { UserDataResponseType } from "../../types";
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
                            {requestIsLoaded(userResponse) &&
                                userResponse.data.map((user) => {
                                    return user.id !== props.myUserId ? (
                                        <Container key={user.id}>
                                            <h1
                                                onClick={() => {
                                                    setTargetUser(user);
                                                }}
                                            >
                                                {user.username}
                                            </h1>
                                        </Container>
                                    ) : (
                                        <React.Fragment key={user.id} />
                                    );
                                })}
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
