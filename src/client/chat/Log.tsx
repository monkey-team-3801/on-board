import React from "react";
import { Row, Col } from "react-bootstrap";
import { MessageData } from "../../types";

type Props = {
    data: MessageData;
    currentUser: string;
};
export const Log: React.FunctionComponent<Props> = (props: Props) => {
    const { data, currentUser } = props;

    const { sendUser, sentTime, content } = data;

    const messageType: React.ReactNode = React.useMemo(() => {
        if (currentUser === sendUser) {
            return (
                <p className="self">
                    ({new Date(sentTime).toLocaleString()}) {sendUser}:{" "}
                    {content}
                </p>
            );
        } else {
            return (
                <p>
                    ({new Date(sentTime).toLocaleString()}) {sendUser}:{" "}
                    {content}
                </p>
            );
        }
    }, [sendUser, currentUser, sentTime, content]);

    return (
        <Row className={`log ${currentUser === sendUser || "self"}`}>
            <Col>{messageType}</Col>
        </Row>
    );
};
