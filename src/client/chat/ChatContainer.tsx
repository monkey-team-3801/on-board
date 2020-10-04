import React from "react";
import { Container, Row, Button, Col, Form } from "react-bootstrap";

import { useDynamicFetch } from "../hooks";
import { useTransformingSocket } from "../hooks/useTransformingSocket";
import { MessageData, NewMessageRequestType, RoomType } from "../../types";
import { ChatEvent, ChatMessageReceiveType } from "../../events";
import { RequestState } from "../types";
import { ChatLog } from "./ChatLog";
import "./Chat.less";

type Props = {
    username: string;
    roomId: string;
    initialChatLog: Array<Omit<MessageData, "sessionId">>;
    roomType: RoomType;
};

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
            if (prev && data) {
                return prev.concat([data]);
            } else {
                return [];
            }
        },
        []
    );

    const { data, setData, socket } = useTransformingSocket<
        Array<Omit<MessageData, "sessionId">>,
        ChatMessageReceiveType
    >(
        ChatEvent.CHAT_MESSAGE_RECEIVE,
        props.initialChatLog,
        undefined,
        transformData
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
        [roomId, username, text, setData, updateChat, socket, roomType]
    );

    if (response.state === RequestState.ERROR) {
        return <div>Error sending message</div>;
    }

    return (
        <Container fluid className="chat-container">
            <Row>
                <ChatLog messages={data || []} currentUser={props.username} />
            </Row>
            <Row className="d-flex justify-content-center">
                <Form onSubmit={onSubmit}>
                    <Form.Row>
                        <Col xs="auto">
                            <Form.Control
                                className="mb-2"
                                value={text}
                                onChange={(e) => {
                                    setText(e.target.value);
                                }}
                            />
                        </Col>
                        <Col xs="auto">
                            <Button type="submit" className="mb-2">
                                Send
                            </Button>
                        </Col>
                    </Form.Row>
                </Form>
            </Row>
        </Container>
    );
};
