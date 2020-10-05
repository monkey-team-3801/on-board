import React from "react";
import { Container, Row } from "react-bootstrap";
import { MessageData, RoomType, UserDataResponseType } from "../../../types";
import { ChatContainer } from "../../chat";
import { Loader } from "../../components";
import { ParticipantsContainer } from "./ParticipantsContainer";

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
            <Row className="mt-4">
                <div className="panel-container tutors-container">
                    <Container>
                        <h4>Tutors</h4>
                    </Container>
                </div>
            </Row>
            <Row className="mt-4">
                <Container className="panel-container students-container d-flex flex-column">
                    <Container>
                        <h4>Participants</h4>
                    </Container>
                    {props.users ? (
                        <ParticipantsContainer
                            users={props.users}
                            raisedHandUsers={props.raisedHandUsers}
                        />
                    ) : (
                        <Loader />
                    )}
                </Container>
            </Row>
            <Row className="mt-4">
                <div className="panel-container messages-container">
                    <Container>
                        <h4>Chat</h4>
                    </Container>
                    <Container fluid>
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
