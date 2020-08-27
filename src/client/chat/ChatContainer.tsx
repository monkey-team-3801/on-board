import React from "react";
import { Container, Row, Button, Col, Form } from "react-bootstrap";

import { useDynamicFetch } from "../hooks";
import { useTransformingSocket } from "../hooks/useTransformingSocket";
import { MessageData } from "../../types";
import { ChatEvent } from "../../events";
import { RequestState } from "../types";
import { ChatLog } from "./ChatLog";

type Props = {
    username: string;
    roomId: string;
    initialChatLog: Array<MessageData>;
};

export const ChatContainer: React.FunctionComponent<Props> = (props: Props) => {
    const [text, setText] = React.useState<string>("");

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

    const [messageArray] = useTransformingSocket<
        Array<MessageData>,
        MessageData
    >(ChatEvent.ON_NEW_MESASGE, transformData, props.initialChatLog);

    const [response, updateChat] = useDynamicFetch<undefined, MessageData>(
        "/chat/newMessage",
        undefined,
        false
    );

    if (response.state === RequestState.ERROR) {
        return <div>Error sending message</div>;
    }

    return (
        <Container>
            <Row>
                <ChatLog messages={messageArray || []} />
            </Row>
            <Row>
                <Form
                    onSubmit={async (e: React.FormEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        await updateChat({
                            sendUser: props.username,
                            content: text,
                            sessionId: props.roomId,
                            sentTime: new Date().toISOString(),
                        });
                    }}
                >
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
