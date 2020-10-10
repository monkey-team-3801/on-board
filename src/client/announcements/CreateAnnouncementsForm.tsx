import { format } from "date-fns/esm";
import React from "react";
import { Alert, Container, Form } from "react-bootstrap";
import Select from "react-select";
import { ExecutingEvent } from "../../events";
import {
    CreateAnnouncementJobRequestType,
    UserEnrolledCoursesResponseType,
} from "../../types";
import { ButtonWithLoadingProp, SimpleDatepicker } from "../components";
import { useDynamicFetch, useFetch } from "../hooks";
import { CourseOptionType } from "../types";
import { requestHasError, requestIsLoaded, requestIsLoading } from "../utils";
import { v4 } from "uuid";

type Props = {
    userId: string;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refreshKey: number;
};

export const CreateAnnouncementsForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading, refreshKey } = props;
    const [createAnnouncementResponse, createAnnouncement] = useDynamicFetch<
        undefined,
        CreateAnnouncementJobRequestType
    >("/job/create", undefined, false);
    const [courseData, refreshCourseData] = useFetch<
        UserEnrolledCoursesResponseType
    >("/user/courses");

    const [title, setTitle] = React.useState<string>("");
    const [content, setContent] = React.useState<string>("");
    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [courses, setCourses] = React.useState<Array<CourseOptionType>>([]);
    const [announcementTime, setAnnouncementTime] = React.useState<Date>(
        new Date()
    );

    const [creatingAnnouncements, setCreatingAnnouncements] = React.useState<
        boolean
    >(false);

    React.useEffect(() => {
        refreshCourseData();
        setCreatingAnnouncements(false);
    }, [refreshKey, refreshCourseData]);

    const isCourseEmpty = React.useMemo(() => {
        return courses.length === 0;
    }, [courses]);

    const isSubmitting: boolean = React.useMemo(() => {
        return (
            requestIsLoading(createAnnouncementResponse) ||
            requestIsLoading(courseData) ||
            creatingAnnouncements
        );
    }, [createAnnouncementResponse, courseData, creatingAnnouncements]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.courses.map((code) => {
                return { value: code, label: code };
            });
            setCourseCodes(options);
            setLoading(false);
        }
    }, [courseData, setLoading]);

    return (
        <Container>
            <Form
                className="mb-3"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setCreatingAnnouncements(true);
                    await Promise.all(
                        courses.map(async (option) => {
                            await createAnnouncement({
                                jobDate: announcementTime.toISOString(),
                                executingEvent: ExecutingEvent.ANNOUNCEMENT,
                                data: {
                                    id: v4(),
                                    title,
                                    content,
                                    courseCode: option.value,
                                },
                            });
                        })
                    );
                }}
            >
                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                        required
                        disabled={isSubmitting}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                        as="textarea"
                        onChange={(e) => {
                            setContent(e.target.value);
                        }}
                        required
                        disabled={isSubmitting}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Course</Form.Label>
                    <Select
                        options={courseCodes}
                        value={courses}
                        onChange={(value) => {
                            if (value && Array.isArray(value)) {
                                setCourses(value);
                            } else {
                                setCourses([]);
                            }
                        }}
                        isDisabled={isSubmitting}
                        isMulti
                        required
                        closeMenuOnSelect={false}
                        styles={{
                            control: (x) => ({
                                ...x,
                                borderColor: isCourseEmpty ? "red" : "initial",
                            }),
                        }}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Schedule announcement</Form.Label>
                    <SimpleDatepicker
                        time={announcementTime}
                        onChange={(time) => {
                            setAnnouncementTime(time);
                        }}
                        disabled={isSubmitting}
                    />
                </Form.Group>
                <ButtonWithLoadingProp
                    variant="primary"
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    invertLoader
                >
                    Create
                </ButtonWithLoadingProp>
            </Form>
            {requestHasError(createAnnouncementResponse) && (
                <Alert variant="danger">
                    {createAnnouncementResponse.message}
                </Alert>
            )}
            {new Date().getTime() > announcementTime.getTime() && (
                <Alert variant="info">
                    This announcement will be sent immediately
                </Alert>
            )}
            {requestIsLoaded(createAnnouncementResponse) && (
                <Alert variant="success">
                    {`Successfully scheduled announcement for ${format(
                        announcementTime,
                        "MM/dd hh:mm"
                    )}`}
                </Alert>
            )}
        </Container>
    );
};
