import React from "react";
import { Col, Row } from "react-bootstrap";
import { GiHand } from "react-icons/gi";
import { UserDataResponseType } from "../../../types";
import { UserDisplay } from "../components";

type Props = {
    users: Array<Omit<UserDataResponseType, "courses">>;
    raisedHandUsers: Array<string>;
};

export const Participants: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <Row>
            {props.users.map((user) => {
                return (
                    <Col key={user.id} xs={4}>
                        <div className="user-display-container">
                            <UserDisplay {...user}>
                                {props.raisedHandUsers.includes(user.id) && (
                                    <GiHand className="hand" />
                                )}
                            </UserDisplay>
                        </div>
                    </Col>
                );
            })}
        </Row>
    );
};
