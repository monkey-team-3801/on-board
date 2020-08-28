import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { MessageData } from "../../types";

type Props = {
    messages: Array<MessageData>;
};

export const ChatLog: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <Container className="chat-log-container">
            {props.messages?.map((m, i) => {
                return (
                    <Row key={i}>
                        <Col>
                            <p>
                                ({new Date(m.sentTime).toLocaleString()}){" "}
                                {m.sendUser}: {m.content}
                            </p>
                        </Col>
                    </Row>
                );
            })}
        </Container>
    );
};
