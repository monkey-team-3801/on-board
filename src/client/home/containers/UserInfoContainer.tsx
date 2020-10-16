import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ProfilePicture } from "../../components/ProfilePicture";
import {
    UserType,
    CourseResponseType,
    UserEnrolledCoursesResponseType,
    UserDataResponseType,
} from "../../../types";
import {
    userTypeToClass,
    requestIsLoading,
    requestIsLoaded,
} from "../../utils";
import { useFetch, useDynamicFetch } from "../../hooks";
import { BaseResponseType } from "../../types";
import { CourseDetailsContainer } from "./CourseDetailsContainer";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    coursesResponse: BaseResponseType<UserEnrolledCoursesResponseType>;
    id: string;
    username: string;
    userType: UserType;
};

export const UserInfoContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, coursesResponse } = props;

    const [courseDetailsResponse, fetchCourseDetails] = useDynamicFetch<
        { [key: string]: Array<Omit<UserDataResponseType, "courses">> },
        { courses: Array<string> }
    >("/courses/details", undefined, false);

    React.useEffect(() => {});

    React.useEffect(() => {
        if (requestIsLoaded(coursesResponse)) {
            fetchCourseDetails({
                courses: coursesResponse.data.courses,
            });
        }
    }, [coursesResponse, fetchCourseDetails]);

    React.useEffect(() => {
        if (requestIsLoaded(courseDetailsResponse)) {
            setLoading(false);
        }
    }, [courseDetailsResponse, setLoading]);

    return (
        <Container fluid>
            <Row>
                <Col lg="2">
                    <ProfilePicture
                        userId={props.id}
                        imgClassName="profile-img"
                    />
                </Col>
                <Col lg="8">
                    <Row>
                        <h5>{props.username}</h5>
                    </Row>
                    <Row>
                        <p className="text-muted text-capitalize">
                            {userTypeToClass(props.userType)}
                        </p>
                    </Row>
                </Col>
                <Col lg="2">
                    <Button size="sm" variant="light">
                        Edit
                    </Button>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <h1>Courses</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    {requestIsLoaded(courseDetailsResponse) &&
                        Object.keys(courseDetailsResponse.data).map(
                            (courseCode) => {
                                return (
                                    <CourseDetailsContainer
                                        key={courseCode}
                                        courseCode={courseCode}
                                        userData={
                                            courseDetailsResponse.data[
                                                courseCode
                                            ]
                                        }
                                    />
                                );
                            }
                        )}
                </Col>
            </Row>
        </Container>
    );
};
