import format from "date-fns/format";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { MessageData } from "../../types";

type Props = {
    data: Omit<MessageData, "sessionId">;
    currentUser: string;
};
export const Log: React.FunctionComponent<Props> = (props: Props) => {
    const { data, currentUser } = props;

    const { sendUser, sentTime, content } = data;

    const messageType: React.ReactNode = React.useMemo(() => {
        if (currentUser === sendUser) {
            return (
                <div className="message-container self p-2 peach-gradient">
                    <div className="d-flex justify-content-between align-items-center">
                        <p>{`${sendUser}`}</p>
                        <p className="time">
                            {`${format(new Date(sentTime), "hh:mm")}`}
                        </p>
                    </div>
                    <p>{content}</p>
                </div>
            );
        } else {
            return (
                <div className="message-container p-2 purple-gradient">
                    <div className="d-flex justify-content-between align-items-center">
                        <p>{`${sendUser}`}</p>
                        <p className="time">
                            {`${format(new Date(sentTime), "hh:mm")}`}
                        </p>
                    </div>
                    <p>{content}</p>
                </div>
            );
        }
    }, [sendUser, currentUser, sentTime, content]);

    return (
        <Row className={`log my-2 ${currentUser === sendUser ? "self" : ""}`}>
            <Col>{messageType}</Col>
        </Row>
    );
};
