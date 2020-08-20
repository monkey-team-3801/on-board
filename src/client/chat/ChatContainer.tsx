import React from "react";
import { useDynamicFetch } from "../hooks";
import { useTransformingSocket } from "../hooks/useTransformingSocket";
import { MessageData } from "../../types";
import { ChatEvent } from "../../events";
import { RequestState } from "../types";

type Props = {
    username: string;
    roomId: string;
    initialChatLog: Array<MessageData>;
};

export const ChatContainer: React.FunctionComponent<Props> = (props: Props) => {
    const [text, setText] = React.useState<string>("");

    const [messageArray] = useTransformingSocket<
        Array<MessageData>,
        MessageData
    >(
        ChatEvent.ON_NEW_MESASGE,
        (prev: Array<MessageData>, data: MessageData) => {
            if (prev && data) {
                return prev.concat([data]);
            } else {
                return [];
            }
        },
        props.initialChatLog
    );

    const [response, updateChat] = useDynamicFetch<undefined, MessageData>(
        "/chat/newMessage",
        undefined,
        false
    );

    if (response.state === RequestState.ERROR) {
        return <div>Error sending message</div>;
    }

    return (
        <div
            onKeyDown={async (e) => {
                if (e.key === "Enter" && text !== "" && props.username !== "") {
                    await updateChat({
                        sendUser: props.username,
                        content: text,
                        sessionId: props.roomId,
                        sentTime: new Date().toISOString(),
                    });
                }
            }}
        >
            <p>Chat container:</p>
            message:{" "}
            <input
                type="text"
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                }}
            />
            <button
                onClick={async () => {
                    await updateChat({
                        sendUser: props.username,
                        content: text,
                        sessionId: props.roomId,
                        sentTime: new Date().toISOString(),
                    });
                }}
            >
                Send
            </button>
            <div>Chat log: </div>
            {messageArray?.map((m, i) => {
                return (
                    <div key={i}>{`${new Date(m.sentTime).toLocaleString()} ${
                        m.sendUser === "" ? "Anon" : m.sendUser
                    }: ${m.content}`}</div>
                );
            })}
        </div>
    );
};
