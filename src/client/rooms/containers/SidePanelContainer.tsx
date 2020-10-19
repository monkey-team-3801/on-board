import React from "react";
import { Container, Row } from "react-bootstrap";
import { MessageData, RoomType, UserDataResponseType } from "../../../types";
import { ChatContainer } from "../../chat";
import { Loader } from "../../components";
import { ParticipantsContainer } from "./ParticipantsContainer";
import "./SidePanelContainer.less";

type Props = {
    sessionId: string;
    username: string;
    initialChatLog: Array<Omit<MessageData, "sessionId">>;
    users?: Array<Omit<UserDataResponseType, "courses">>;
    raisedHandUsers: Array<string>;
    roomType: RoomType;
    socket: SocketIOClient.Socket;
};

export const SidePanelContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container className="panel">
            <Row>
                <div className="panel-container tutors-container">
                    <Container className="section-header">
                        <h6>Tutor Team</h6>
                    </Container>
                </div>
            </Row>
            <Row>
                <Container className="panel-container students-container ">
                    <Container className="section-header">
                        <h6>Participants</h6>
                    </Container>
                    {props.users ? (
                        <ParticipantsContainer
                            users={props.users}
                            raisedHandUsers={props.raisedHandUsers}
                        />
                    ) : (
                        <Container className="loader-container">
                            <Loader />
                        </Container>
                    )}
                </Container>
            </Row>
            <Row>
                <div className="panel-container messages-container">
                    <Container className="section-header">
                        <h6>Chat</h6>
                    </Container>
                    <Container fluid className="chat-outer-container pl-0">
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
