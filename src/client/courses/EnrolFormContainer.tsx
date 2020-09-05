import React from "react";
import { Form, Button, Container, Row } from "react-bootstrap";
import Select from "react-select";

import { useDynamicFetch, useFetch } from "../hooks";
import {
    CourseListResponseType,
    UserEnrolledCoursesResponseType,
    EnrolCourseRequestType,
} from "../../types";
import { requestIsLoaded } from "../utils";
import { CourseOptionType } from "../types";

type Props = {
    userId: string;
};

export const EnrolFormContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const [courseData] = useFetch<CourseListResponseType>("/courses/list");
    const [enrolledCoursesData] = useFetch<UserEnrolledCoursesResponseType>(
        "/user/courses"
    );
    const [enrolCourseResponse, enrolInCourses] = useDynamicFetch<
        undefined,
        EnrolCourseRequestType
    >("/user/enrol", undefined, false);

    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [enrolledCourse, setEnrolledCourses] = React.useState<
        Array<CourseOptionType>
    >([]);

    const initialCoursesRef = React.useRef<Array<CourseOptionType>>([]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData?.data?.map((course) => {
                return { value: course.code, label: course.code };
            });
            setCourseCodes(options);
        }
    }, [courseData]);

    React.useEffect(() => {
        if (requestIsLoaded(enrolledCoursesData)) {
            const options = enrolledCoursesData?.data?.courses.map((course) => {
                return { value: course, label: course };
            });
            initialCoursesRef.current = options;
            setEnrolledCourses(options);
        }
    }, [enrolledCoursesData]);

    const isSubmitting: boolean = React.useMemo(() => {
        return !requestIsLoaded(enrolCourseResponse);
    }, [enrolCourseResponse]);

    if (!requestIsLoaded(courseData) || !requestIsLoaded(enrolledCoursesData)) {
        return <div>loading</div>;
    }

    return (
        <Container>
            <Row>
                <h3>Course Enrolment</h3>
            </Row>
            <Form
                onSubmit={async (e) => {
                    e.preventDefault();
                    await enrolInCourses({
                        userId: props.userId,
                        courses: enrolledCourse.map((course) => course.value),
                    });
                }}
            >
                <Form.Group>
                    <Form.Label>Course</Form.Label>
                    <Select
                        options={courseCodes}
                        value={enrolledCourse}
                        onChange={(value) => {
                            if (value && Array.isArray(value)) {
                                setEnrolledCourses(value);
                            } else {
                                setEnrolledCourses([]);
                            }
                        }}
                        isMulti
                        closeMenuOnSelect={false}
                        disabled={isSubmitting}
                    />
                </Form.Group>
                <Form.Row>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        Enrol
                    </Button>
                </Form.Row>
                <Form.Row>
                    <Button
                        variant="light"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => {
                            setEnrolledCourses(initialCoursesRef.current);
                        }}
                    >
                        clear
                    </Button>
                </Form.Row>
            </Form>
        </Container>
    );
};
