import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { ChatEvent, ChatMessageReceiveType } from "../../events";
import { MessageData, NewMessageRequestType, RoomType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { useTransformingSocket } from "../hooks/useTransformingSocket";
import { RequestState } from "../types";
import "./Chat.less";
import { ChatLog } from "./ChatLog";
import { socket } from "../io";

type Props = {
    myUsername: string;
    theirUsername: string;
    theirUserId: string;
    initialChatLog: Array<Omit<MessageData, "sessionId">>;
    chatId: string;
};

export const PrivateChatContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    // const { roomId, username, roomType } = props;

    const [text, setText] = React.useState<string>("");

    // const [response, updateChat] = useDynamicFetch<
    //     undefined,
    //     NewMessageRequestType
    // >("/chat/newMessage", undefined, false);

    // const transformData = React.useCallback(
    //     (
    //         prev: Array<Omit<MessageData, "sessionId">> | undefined,
    //         data: Omit<MessageData, "sessionId">
    //     ) => {
    //         if (data.sendUser === username) {
    //             return prev;
    //         }
    //         if (prev && data) {
    //             return prev.concat([data]);
    //         } else {
    //             return [];
    //         }
    //     },
    //     [username]
    // );

    // const { data, setData, socket } = useTransformingSocket<
    //     Array<Omit<MessageData, "sessionId">>,
    //     ChatMessageReceiveType
    // >(
    //     ChatEvent.CHAT_MESSAGE_RECEIVE,
    //     props.initialChatLog,
    //     undefined,
    //     transformData,
    //     () => {},
    //     props.socket
    // );

    const onSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLDivElement>) => {
            e.preventDefault();
            socket.emit("newmessage", props.chatId);
            // if (text === "") {
            //     return;
            // }
            // setText("");

            // const date: string = new Date().toISOString();
            // const message: MessageData = {
            //     sendUser: username,
            //     content: text,
            //     sessionId: roomId,
            //     sentTime: date,
            // };
            // setData((messageData) => {
            //     return messageData?.concat([message]);
            // });
            // socket.emit(ChatEvent.CHAT_MESSAGE_SEND, message);
            // await updateChat({
            //     ...message,
            //     roomType,
            // });
        },
        []
    );

    // if (response.state === RequestState.ERROR) {
    //     return <div>Error sending message</div>;
    // }

    return (
        <Container fluid className="chat-container">
            <Row>
                <ChatLog
                    messages={props.initialChatLog || []}
                    currentUser={props.myUsername}
                />
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
