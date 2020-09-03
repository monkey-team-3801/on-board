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
    initialChatLog: Array<MessageData>;
};

export const ChatContainer: React.FunctionComponent<Props> = (props: Props) => {
    const { roomId, username } = props;

    const [text, setText] = React.useState<string>("");

    const [response, updateChat] = useDynamicFetch<
        undefined,
        NewMessageRequestType
    >("/chat/newMessage", undefined, false);

    const componentDidMount = React.useCallback(
        (socket: SocketIOClient.Socket) => {
            return socket.emit(RoomEvent.PRIVATE_ROOM_JOIN, {
                sessionId: props.roomId,
            });
        },
        [props.roomId]
    );

    const transformData = React.useCallback(
        (prev: Array<MessageData> | undefined, data: MessageData) => {
            if (prev && data) {
                return prev.concat([data]);
            } else {
                return [];
            }
        },
        []
    );

    const { data, setData, socket } = useTransformingSocket<
        Array<MessageData>,
        ChatMessageReceiveType
    >(
        ChatEvent.CHAT_MESSAGE_RECEIVE,
        componentDidMount,
        transformData,
        props.initialChatLog
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
