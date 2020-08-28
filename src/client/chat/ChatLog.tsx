import React from "react";
import { Container } from "react-bootstrap";
import { MessageData } from "../../types";
import { Log } from "./Log";

type Props = {
    messages: Array<MessageData>;
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
