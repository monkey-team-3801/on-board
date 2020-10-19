import React from "react";
import { Col, Row } from "react-bootstrap";
import { UserDataResponseType } from "../../../types";
import { ProfilePicture } from "../../components";

type Props = {
    header?: string;
    users: Array<Omit<UserDataResponseType, "courses">>;
    onlineUsers: Array<string>;
};

export const CourseStaffList: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <>
            <Row className="mt-1 mb-1">
                <p className="text-muted">{props.header}</p>
            </Row>
            <Row>
                {props.users.length === 0 ? (
                    <p>This course has no {props.header?.toLowerCase()}...</p>
                ) : (
                    props.users.map((user) => {
                        return (
                            <Col lg="3" className="my-1">
                                <Row>
                                    <Col lg="4">
                                        <Row>
                                            <ProfilePicture
                                                userId={user.id}
                                                imgClassName="course-user-profile"
                                                openChatOnClick
                                                showStatusOrb
                                                online={props.onlineUsers.includes(
                                                    user.id
                                                )}
                                            />
                                        </Row>
                                    </Col>
                                    <Col lg="8">
                                        <Row>
                                            <p>{user.username}</p>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        );
                    })
                )}
            </Row>
        </>
    );
};
