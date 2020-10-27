import React from "react";
import { Container, Row } from "react-bootstrap";
import { MessageData, RoomType, UserDataResponseType, UserType } from "../../../types";
import { ChatContainer } from "../../chat";
import { Loader } from "../../components";
import { ParticipantsContainer } from "./ParticipantsContainer";
import "./SidePanelContainer.less";
import { isStaff } from "../../utils";

type Props = {
    sessionId: string;
    username: string;
    myUserId: string;
    initialChatLog: Array<Omit<MessageData, "sessionId">>;
    users?: Array<Omit<UserDataResponseType, "courses">>;
    raisedHandUsers: Array<string>;
    roomType: RoomType;
    socket: SocketIOClient.Socket;
};

/**
 * Container for rendering the side panel displayed in all rooms.
 */
export const SidePanelContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container className="panel">
            <Row>
                <div className="panel-container tutors-container">
                    <Container className="section-header">
                        <h6>Staff</h6>
                    </Container>
                    {props.users ? (
                        <ParticipantsContainer
                            users={props.users.filter((user) => isStaff(user.userType))}
                            raisedHandUsers={props.raisedHandUsers}
                            myUserId={props.myUserId}
                        />
                    ) : (
                        <Container className="loader-container">
                            <Loader />
                        </Container>
                    )}
                </div>
            </Row>
            <Row>
                <Container className="panel-container students-container">
                    <Container className="section-header">
                        <h6>Participants</h6>
                    </Container>
                    {props.users ? (
                        <ParticipantsContainer
                            users={props.users.filter((user) => !isStaff(user.userType))}
                            raisedHandUsers={props.raisedHandUsers}
                            myUserId={props.myUserId}
                        />
                    ) : (
                        <Container className="loader-container">
                            <Loader />
                        </Container>
                    )}
                </Container>
            </Row>
            <Row className="messages-row">
                <div className="panel-container messages-container">
                    <Container className="section-header">
                        <h6>Chat</h6>
                    </Container>
                    <Container fluid className="chat-outer-container">
                        <ChatContainer
                            roomId={props.sessionId}
                            username={props.username}
                            initialChatLog={props.initialChatLog}
                            roomType={props.roomType}
                            socket={props.socket}
                        />
                    </Container>
                </div>
            </Row>
        </Container>
    );
};
