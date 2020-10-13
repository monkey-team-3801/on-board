import { List } from "immutable";
import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { MessageData, UserDataResponseType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { socket } from "../io";
import { requestIsLoaded } from "../utils";
import { ChatLog } from "./ChatLog";
import { ChatEvent } from "../../events";
import { useDebouncedCallback } from "use-debounce/lib";

type Props = {
    targetUserData: UserDataResponseType & {
        shouldClearNewMessage: boolean;
    };
    myUserId: string;
    myUsername: string;
    onNewMessageClear?: () => void;
};

export const ChatSession: React.FunctionComponent<Props> = (props: Props) => {
    const { myUserId, myUsername, onNewMessageClear } = props;
    const { id: theirUserId } = props.targetUserData;

    const [text, setText] = React.useState<string>("");

    const [chatDataResponse, getChatData] = useDynamicFetch<
        { chatId: string; messages: Array<Omit<MessageData, "sessionId">> },
        {
            myUserId: string;
            theirUserId: string;
        }
    >(
        "/chat/privateChat",
        {
            myUserId: props.myUserId,
            theirUserId: props.targetUserData.id,
        },
        false
    );

    const [, updateData] = useDynamicFetch<
        undefined,
        {
            message: Omit<MessageData, "sessionId">;
            chatId: string;
            theirUserId: string;
        }
    >("/chat/privateChat/newMessage", undefined, false);

    const [, clearNewMessage] = useDynamicFetch<
        undefined,
        {
            chatId: string;
            myUserId: string;
        }
    >("/chat/clearNewMessage", undefined, false);

    const debounceClearNewMessage = useDebouncedCallback(
        clearNewMessage,
        1000,
        { leading: true }
    );

    const [chatData, setChatData] = React.useState<
        List<Omit<MessageData, "sessionId">>
    >(List([]));

    const onNewMessage = React.useCallback((data) => {
        setChatData((prev) => {
            return prev.push(data);
        });
    }, []);

    React.useEffect(() => {
        getChatData({
            myUserId,
            theirUserId,
        });
    }, [theirUserId, myUserId, getChatData]);

    React.useEffect(() => {
        socket.on(ChatEvent.CHAT_NEW_PRIVATE_MESSAGE, onNewMessage);
        return () => {
            socket.off(ChatEvent.CHAT_NEW_PRIVATE_MESSAGE, onNewMessage);
        };
    }, [onNewMessage]);

    React.useEffect(() => {
        if (requestIsLoaded(chatDataResponse)) {
            socket.emit(ChatEvent.CHAT_JOIN, chatDataResponse.data.chatId);
            setChatData(List(chatDataResponse.data.messages));
        }
        return () => {
            if (chatDataResponse.data?.chatId) {
                socket.emit(ChatEvent.CHAT_LEAVE, chatDataResponse.data.chatId);
            }
        };
    }, [chatDataResponse, onNewMessage]);

    React.useEffect(() => {
        if (requestIsLoaded(chatDataResponse)) {
            if (props.targetUserData.shouldClearNewMessage) {
                debounceClearNewMessage.callback({
                    chatId: chatDataResponse.data.chatId,
                    myUserId,
                });
                onNewMessageClear?.();
            }
        }
    }, [
        chatDataResponse,
        props.targetUserData.shouldClearNewMessage,
        myUserId,
        debounceClearNewMessage,
        onNewMessageClear,
    ]);

    const onSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLDivElement>) => {
            e.preventDefault();
            setText("");
            if (chatDataResponse.data?.chatId && text) {
                const data = {
                    sendUser: myUsername,
                    content: text,
                    sentTime: new Date().toISOString(),
                };
                onNewMessage(data);
                socket.emit(
                    ChatEvent.CHAT_NEW_PRIVATE_MESSAGE,
                    chatDataResponse.data.chatId,
                    data
                );
                await updateData({
                    message: data,
                    chatId: chatDataResponse.data.chatId,
                    theirUserId,
                });
            }
        },
        [
            myUsername,
            text,
            chatDataResponse.data,
            onNewMessage,
            theirUserId,
            updateData,
        ]
    );

    return (
        <Container className="private-chat">
            {requestIsLoaded(chatDataResponse) ? (
                <Container fluid className="chat-container">
                    <Row>
                        <ChatLog
                            messages={chatData.toArray()}
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
            ) : (
                <div>loading</div>
            )}
        </Container>
    );
};
