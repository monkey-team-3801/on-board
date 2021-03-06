import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { ChatEvent, ChatMessageReceiveType } from "../../events";
import { MessageData, NewMessageRequestType, RoomType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { useTransformingSocket } from "../hooks/useTransformingSocket";
import { RequestState } from "../types";
import "./Chat.less";
import { ChatLog } from "./ChatLog";

type Props = {
    // Current user name.
    username: string;
    // Current room id the chat container is in.
    roomId: string;
    // Initial chat logs for this chat session.
    initialChatLog: Array<Omit<MessageData, "sessionId">>;
    // The type of room the chat is in.
    roomType: RoomType;
    // Relevant socket to the session.
    socket: SocketIOClient.Socket;
};

/**
 * Container wrapper for initialising chat boxes and handling the passing of messages.
 */
export const ChatContainer: React.FunctionComponent<Props> = (props: Props) => {
    const { roomId, username, roomType } = props;

    const [text, setText] = React.useState<string>("");

    const [response, updateChat] = useDynamicFetch<
        undefined,
        NewMessageRequestType
    >("/chat/newMessage", undefined, false);

    const transformData = React.useCallback(
        (
            prev: Array<Omit<MessageData, "sessionId">> | undefined,
            data: Omit<MessageData, "sessionId">
        ) => {
            if (data.sendUser === username) {
                return prev;
            }
            if (prev && data) {
                return prev.concat([data]);
            } else {
                return [];
            }
        },
        [username]
    );

    const { data, setData, socket } = useTransformingSocket<
        Array<Omit<MessageData, "sessionId">>,
        ChatMessageReceiveType
    >(
        ChatEvent.CHAT_MESSAGE_RECEIVE,
        props.initialChatLog,
        undefined,
        transformData,
        () => {},
        props.socket
    );

    const onSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLDivElement>) => {
            e.preventDefault();
            if (text === "") {
                return;
            }
            setText("");

            const date: string = new Date().toISOString();
            const message: MessageData = {
                sendUser: username,
                content: text,
                sessionId: roomId,
                sentTime: date,
            };
            setData((messageData) => {
                return messageData?.concat([message]);
            });
            socket.emit(ChatEvent.CHAT_MESSAGE_SEND, message);
            await updateChat({
                ...message,
                roomType,
            });
        },
        [roomId, username, text, socket, roomType, updateChat, setData]
    );

    if (response.state === RequestState.ERROR) {
        return <div>Error sending message</div>;
    }

    return (
        <Container fluid className="chat-container">
            <Row>
                <ChatLog messages={data || []} currentUser={props.username} />
            </Row>
            <Row className="d-flex m-1 p-1 justify-content-center">
                <Form onSubmit={onSubmit}>
                    <Form.Row className="d-flex justify-content-center flex-nowrap align-content-start">
                        <Col>
                            <Form.Control
                                className="send-chat"
                                placeholder="Send a message"
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                }}
                            />
                        </Col>
                        <Col xs="auto">
                            <Button type="submit" className="mr-2" size="sm">
                                Send
                            </Button>
                        </Col>
                    </Form.Row>
                </Form>
            </Row>
        </Container>
    );
};
