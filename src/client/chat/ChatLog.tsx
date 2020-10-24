import React from "react";
import { Container } from "react-bootstrap";
import { MessageData } from "../../types";
import { Log } from "./Log";

type Props = {
    messages: Array<Omit<MessageData, "sessionId">>;
    currentUser: string;
};

export const ChatLog: React.FunctionComponent<Props> = (props: Props) => {
    const { messages } = props;
    const scrollAnchorRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Container className="chat-log-container">
            <p className="text-center py-2 text-white">Beginning of chat...</p>
            {messages?.map((messageData, i) => {
                return (
                    <Log
                        key={i}
                        data={messageData}
                        currentUser={props.currentUser}
                    />
                );
            })}
            <div ref={scrollAnchorRef} />
        </Container>
    );
};
