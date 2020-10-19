import React from "react";
import { Row, Col } from "react-bootstrap";
import { ProfilePicture } from "../../components";
import { UserDataResponseType } from "../../../types";

type Props = {
    header?: string;
    users: Array<Omit<UserDataResponseType, "courses">>;
};

export const CourseStaffList: React.FunctionComponent<Props> = (
    props: Props
) => {
    return (
        <>
            <Row className="mt-2 mb-1">
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
