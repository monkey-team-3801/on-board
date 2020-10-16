import React from "react";
import { UserDataResponseType, UserType } from "../../../types";
import { Container, Row, Col } from "react-bootstrap";
import { ProfilePicture } from "../../components/ProfilePicture";

type Props = {
    courseCode: string;
    userData: Array<Omit<UserDataResponseType, "courses">>;
};

export const CourseDetailsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userData } = props;

    const coordinators = React.useMemo(() => {
        return userData.filter((user) => {
            return user.userType === UserType.COORDINATOR;
        });
    }, [userData]);

    const tutors = React.useMemo(() => {
        return userData.filter((user) => {
            return user.userType === UserType.TUTOR;
        });
    }, [userData]);

    return (
        <Container className="mt-2 mb-1">
            <Row>
                <h2>{props.courseCode}</h2>
            </Row>
            <Row>
                <p className="text-muted">Coordinators</p>
            </Row>
            <Row>
                {coordinators.map((user) => {
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
                })}
            </Row>
            {/* <Row> TODO DO THIS
                <p className="text-muted">Tutors</p>
            </Row>
            <Row>
                {tutors.map((user) => {
                    return (
                        <Col lg="3" className="my-1">
                            <Row>
                                <Col lg="4">
                                    <Row>
                                        <ProfilePicture
                                            userId={user.id}
                                            imgClassName="course-user-profile"
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
                })}
            </Row> */}
        </Container>
    );
};
