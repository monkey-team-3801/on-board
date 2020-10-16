import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { UserEnrolledCoursesResponseType } from "../../../types";
import { ContainerWrapper } from "../../components";
import { EnrolFormContainer } from "../../courses";
import { useDynamicFetch, useFetch } from "../../hooks";

type Props = {
    userID: string;
};

export const EnrolmentOptionsContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [enrolledCoursesData, refreshEnrolledCourse] = useFetch<
        UserEnrolledCoursesResponseType
    >("/user/courses");

    return (
        <Container>
            <Row>
                <div>
                    <h6>
                        You are currently enrolled in the following courses:
                    </h6>
                    {enrolledCoursesData.data?.courses.map((course, i) => (
                        <p key={i}>{course}</p>
                    ))}
                </div>
            </Row>
            <br></br>
            <Row>
                <h6>You can enrol in more courses bellow:</h6>
                <ContainerWrapper>
                    {(setLoading) => {
                        return (
                            <EnrolFormContainer
                                userId={props.userID}
                                setLoading={setLoading}
                            />
                        );
                    }}
                </ContainerWrapper>
            </Row>
        </Container>
    );
};
