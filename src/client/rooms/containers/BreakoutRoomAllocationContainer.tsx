import React from "react";
import { Container, Col } from "react-bootstrap";
import { UserDataResponseType } from "../../../types";

type Props = {
    amount: number;
    users: Array<Omit<UserDataResponseType, "courses">>;
};

export const BreakoutRoomAllocationContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <Container>
            <Col lg={6}>
                {Array.from({ length: props.amount }).map((_, i) => {
                    return <div key={i}></div>;
                })}
            </Col>
            <Col lg={6}>
                {props.users.map((user) => {
                    return <div key={user.id}>{user.username}</div>;
                })}
            </Col>
        </Container>
    );
};
