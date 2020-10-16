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

                <div className="message-container">
                    <p className="self">
                        {`${sendUser}: `}
                        <br></br>
                        {content}
                        <br></br>
                        {` (${format(
                            new Date(sentTime),
                            "MM/dd hh:mm"
                        )})`}
                    </p>
                </div>
            );
        } else {
            return (
                <div className="message-container">
                    <p >
                        {`${sendUser}: `}
                        <br></br>
                        {content}
                        <br></br>

                        {` (${format(
                            new Date(sentTime),
                            "MM/dd hh:mm"
                        )})`}
                    </p>
                </ div>
            );
        }
    }, [sendUser, currentUser, sentTime, content]);

    return (
        <Row className={`log ${currentUser === sendUser ? "self" : ""}`}>
            <Col>{messageType}</Col>
        </Row>
    );
};
