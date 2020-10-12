import React from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { MessageData, UserDataResponseType } from "../../types";
import { useDynamicFetch } from "../hooks";
import { socket } from "../io";
import { requestIsLoaded } from "../utils";
import { ChatLog } from "./ChatLog";
import { List } from "immutable";

type Props = {
    targetUserData: UserDataResponseType;
    myUserId: string;
    myUsername: string;
};

export const ChatSession: React.FunctionComponent<Props> = (props: Props) => {
    const { myUserId, myUsername } = props;
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

    const [chatData, setChatData] = React.useState<
        List<Omit<MessageData, "sessionId">>
    >(List([]));

    const onNewMessage = React.useCallback((data) => {
        // const { sendUser, content, sentTime } = data;
        console.log(data);
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
        if (requestIsLoaded(chatDataResponse)) {
            socket.emit("joinchat", chatDataResponse.data.chatId);
            setChatData(List(chatDataResponse.data.messages));
        }
        socket.on("newmessage", onNewMessage);
        return () => {
            if (chatDataResponse.data?.chatId) {
                socket.emit("leavechat", chatDataResponse.data.chatId);
            }
            socket.off("newmessage", onNewMessage);
        };
    }, [chatDataResponse]);

    const onSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLDivElement>) => {
            e.preventDefault();
            setText("");
            if (chatDataResponse.data?.chatId) {
                const data = {
                    sendUser: myUsername,
                    content: text,
                    sentTime: new Date().toISOString(),
                };
                onNewMessage(data);
                socket.emit("newmessage", chatDataResponse.data.chatId, data);
                await updateData({
                    message: data,
                    chatId: chatDataResponse.data.chatId,
                    theirUserId,
                });
            }

            // if (text === "") {
            //     return;
            // }

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
        [myUsername, text, chatDataResponse.data, onNewMessage]
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
