import React from "react";
import { Container } from "react-bootstrap";
import { UserDataResponseType, MessageData } from "../../types";
import { useDynamicFetch } from "../hooks";
import { PrivateChatContainer } from "./PrivateChatContainer";
import { requestIsLoaded } from "../utils";
import { socket } from "../io";

type Props = {
    targetUserData: UserDataResponseType;
    myUserId: string;
    myUsername: string;
};

export const ChatSession: React.FunctionComponent<Props> = (props: Props) => {
    const { myUserId } = props;
    const { id: theirUserId } = props.targetUserData;

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

    const onNewMessage = React.useCallback(() => {
        console.log("new msg");
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
        }
        socket.on("newmessage", onNewMessage);
        return () => {
            if (chatDataResponse.data?.chatId) {
                socket.emit("leavechat", chatDataResponse.data.chatId);
            }
            socket.off("newmessage", onNewMessage);
        };
    }, [chatDataResponse, onNewMessage]);

    return (
        <Container>
            {requestIsLoaded(chatDataResponse) ? (
                <PrivateChatContainer
                    myUsername={props.myUsername}
                    theirUserId={props.targetUserData.id}
                    theirUsername={props.targetUserData.username}
                    initialChatLog={chatDataResponse.data.messages}
                    chatId={chatDataResponse.data.chatId}
                />
            ) : (
                <div>loading</div>
            )}
        </Container>
    );
};
