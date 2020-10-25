import React from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import Select from "react-select";
import {
    CourseListResponseType,
    EnrolCourseRequestType,
    UserEnrolledCoursesResponseType,
} from "../../types";
import { ButtonWithLoadingProp, Loader } from "../components";
import { useDynamicFetch, useFetch } from "../hooks";
import { BaseResponseType, CourseOptionType } from "../types";
import { requestIsLoaded, requestIsLoading } from "../utils";

type Props = {
    userId: string;
    coursesResponse: BaseResponseType<UserEnrolledCoursesResponseType>;
    refreshCourseData?: () => Promise<void>;
};

export const EnrolFormContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userId, coursesResponse } = props;
    const [courseData] = useFetch<CourseListResponseType>("/courses/list");

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

    const [loading, setLoading] = React.useState<boolean>(true);

    const initialCoursesRef = React.useRef<Array<CourseOptionType>>([]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.map((course) => {
                return { value: course.code, label: course.code };
            });
            setCourseCodes(options);
        }
    }, [courseData]);

    React.useEffect(() => {
        if (requestIsLoaded(coursesResponse)) {
            const options = coursesResponse.data.courses.map((code) => {
                return { value: code, label: code };
            });
            initialCoursesRef.current = options;
            setEnrolledCourses(options);
        }
    }, [coursesResponse]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData) && requestIsLoaded(coursesResponse)) {
            setLoading(false);
        }
    }, [courseData, coursesResponse]);

    const isSubmitting: boolean = React.useMemo(() => {
        return requestIsLoading(enrolCourseResponse);
    }, [enrolCourseResponse]);

    if (loading) {
        return (
            <Container className="mt-2">
                <Loader />
            </Container>
        );
    }

    return (
        <Container>
            <Form
                className="mb-3"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const data: EnrolCourseRequestType = {
                        userId,
                        courses: enrolledCourse.map((course) => course.value),
                    };
                    await enrolInCourses(data);
                    await props.refreshCourseData?.();
                }}
            >
                <Form.Group>
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
                    />
                </Form.Group>
                <Form.Row>
                    <ButtonWithLoadingProp
                        size="sm"
                        variant="primary"
                        type="submit"
                        invertLoader
                        loading={isSubmitting}
                    >
                        Enrol
                    </ButtonWithLoadingProp>
                    <Button
                        variant="light"
                        size="sm"
                        className="ml-1"
                        onClick={() => {
                            setEnrolledCourses(initialCoursesRef.current);
                        }}
                    >
                        Reset Changes
                    </Button>
                </Form.Row>
            </Form>
            {requestIsLoaded(enrolCourseResponse) && (
                <Alert variant="success">Successfully updated enrolment</Alert>
            )}
        </Container>
    );
};
