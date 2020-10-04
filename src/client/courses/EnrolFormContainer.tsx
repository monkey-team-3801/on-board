import React from "react";
import { Alert, Button, Container, Form } from "react-bootstrap";
import Select from "react-select";
import { AnnouncementEvent } from "../../events";
import {
    CourseListResponseType,
    EnrolCourseRequestType,
    UserEnrolledCoursesResponseType,
} from "../../types";
import { ButtonWithLoadingProp } from "../components";
import { useDynamicFetch, useFetch } from "../hooks";
import { CourseOptionType } from "../types";
import { requestIsLoaded, requestIsLoading } from "../utils";

type Props = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refresh: () => void;
    userId: string;
    socket: SocketIOClient.Socket;
};

export const EnrolFormContainer: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { userId, refresh, socket, setLoading } = props;
    const [courseData] = useFetch<CourseListResponseType>("/courses/list");
    const [enrolledCoursesData, refreshEnrolledCourse] = useFetch<
        UserEnrolledCoursesResponseType
    >("/user/courses");

    const refreshAnnouncements = React.useCallback(() => {
        refresh();
    }, [refresh]);

    const [enrolCourseResponse, enrolInCourses] = useDynamicFetch<
        undefined,
        EnrolCourseRequestType
    >("/user/enrol", undefined, false, refreshAnnouncements);

    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [enrolledCourse, setEnrolledCourses] = React.useState<
        Array<CourseOptionType>
    >([]);

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
        if (requestIsLoaded(enrolledCoursesData)) {
            const options = enrolledCoursesData.data.courses.map((course) => {
                return { value: course, label: course };
            });
            initialCoursesRef.current = options;
            setEnrolledCourses(options);
        }
    }, [enrolledCoursesData]);

    React.useEffect(() => {
        if (requestIsLoaded(enrolledCoursesData)) {
            setLoading(false);
        }
    }, [enrolledCoursesData, setLoading]);

    const isSubmitting: boolean = React.useMemo(() => {
        return requestIsLoading(enrolCourseResponse);
    }, [enrolCourseResponse]);

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
                    socket.emit(
                        AnnouncementEvent.COURSE_ANNOUNCEMENTS_SUBSCRIBE,
                        {
                            courses: data.courses,
                        }
                    );
                    await refreshEnrolledCourse();
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
                    />
                </Form.Group>
                <Form.Row>
                    <ButtonWithLoadingProp
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
                        className="mu-1 ml-1"
                        onClick={() => {
                            setEnrolledCourses(initialCoursesRef.current);
                        }}
                    >
                        Reset Changes
                    </Button>
                </Form.Row>
            </Form>
            {requestIsLoaded(enrolCourseResponse) && (
                <Alert variant="success">Successfully enrolled</Alert>
            )}
        </Container>
    );
};
