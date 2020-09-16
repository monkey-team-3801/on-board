import React from "react";
import { Container, Row, Button, Col, Form } from "react-bootstrap";

import { useDynamicFetch } from "../hooks";
import { useTransformingSocket } from "../hooks/useTransformingSocket";
import { MessageData, NewMessageRequestType } from "../../types";
import { ChatEvent, ChatMessageReceiveType, RoomEvent } from "../../events";
import { RequestState } from "../types";
import { ChatLog } from "./ChatLog";

type Props = {
    username: string;
    roomId: string;
    initialChatLog: Array<Omit<MessageData, "sessionId">>;
};

export const ChatContainer: React.FunctionComponent<Props> = (props: Props) => {
    const { roomId, username } = props;

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
            });
        },
        [roomId, username, text, setData, updateChat, socket]
    );

    if (response.state === RequestState.ERROR) {
        return <div>Error sending message</div>;
    }

    return (
        <Container>
            <Row>
                <ChatLog messages={data || []} currentUser={props.username} />
            </Row>
            <Row>
                <Form onSubmit={onSubmit}>
                    <Form.Row>
                        <Col xs="auto">
                            <Form.Control
                                className="mb-2"
                                id="inlineFormInput"
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
