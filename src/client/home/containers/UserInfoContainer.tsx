import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { RouteComponentProps, Link } from "react-router-dom";
import {
    UserDataResponseType,
    UserEnrolledCoursesResponseType,
    UserType,
} from "../../../types";
import { ProfilePicture } from "../../components/ProfilePicture";
import { useDynamicFetch } from "../../hooks";
import { BaseResponseType } from "../../types";
import { requestIsLoaded, userTypeToClass } from "../../utils";
import { CourseDetailsContainer } from "./CourseDetailsContainer";

type Props = RouteComponentProps & {
    // Setter for the loading state.
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    // Response for the course data request.
    coursesResponse: BaseResponseType<UserEnrolledCoursesResponseType>;
    // Current user id.
    id: string;
    // Current user name.
    username: string;
    // Current user type.
    userType: UserType;
    // List of online users.
    onlineUsers: Array<string>;
};

/**
 * Home page component displaying the info about the current user.
 */
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
                    <Button
                        size="sm"
                        variant="light"
                        onClick={() => {
                            props.history.push("/profile");
                        }}
                    >
                        Edit
                    </Button>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <h1>Enrolled Courses</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    {requestIsLoaded(courseDetailsResponse) && (
                        <>
                            {Object.keys(courseDetailsResponse.data).length ===
                                0 && (
                                <Container>
                                    <Row className="d-flex justify-content-center">
                                        <p className="text-muted">
                                            Looks like your not enrolled in any
                                            courses.
                                        </p>
                                    </Row>
                                    <Row className="d-flex justify-content-center">
                                        <Link to="/profile">
                                            <Button size="sm" variant="light">
                                                Enrol
                                            </Button>
                                        </Link>
                                    </Row>
                                </Container>
                            )}
                            {Object.keys(courseDetailsResponse.data).map(
                                (courseCode, index) => {
                                    return (
                                        <CourseDetailsContainer
                                            key={courseCode}
                                            courseCode={courseCode}
                                            onlineUsers={props.onlineUsers}
                                            userData={
                                                courseDetailsResponse.data[
                                                    courseCode
                                                ]
                                            }
                                            showHr={
                                                index !==
                                                Object.keys(
                                                    courseDetailsResponse.data
                                                ).length -
                                                    1
                                            }
                                        />
                                    );
                                }
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
};
