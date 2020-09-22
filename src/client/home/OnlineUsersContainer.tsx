import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./Classes.less";

type Props = {
    setShowLoader: React.Dispatch<React.SetStateAction<boolean>>;
    onlineUsers: Array<string>;
};

export const OnlineUsersContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <>
            <Row>
                <Container>
                    <ol>
                        {props.onlineUsers.map((x) => (
                            <li>{x}</li>
                        ))}
                    </ol>
                </Container>
            </Row>
        </>
    );
};
