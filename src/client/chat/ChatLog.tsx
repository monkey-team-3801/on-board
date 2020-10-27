import React from "react";
import { Container } from "react-bootstrap";
import { MessageData } from "../../types";
import { Log } from "./Log";

type Props = {
    // List of messages to render.
    messages: Array<Omit<MessageData, "sessionId">>;
    // Username of the current user.
    currentUser: string;
};

/**
 * Component for rendering an list of chat log entries.
 */
export const ChatLog: React.FunctionComponent<Props> = (props: Props) => {
    const { messages } = props;
    const scrollAnchorRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        scrollAnchorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        });
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
