import React from "react";
import { Form, Button, Container, Row, Alert } from "react-bootstrap";
import Select from "react-select";

import { useDynamicFetch, useFetch } from "../hooks";
import {
    CourseListResponseType,
    CreateAnnouncementJobRequestType,
} from "../../types";
import { requestIsLoaded, requestHasError, requestIsLoading } from "../utils";
import { ExecutingEvent } from "../../events";
import { CourseOptionType } from "../types";
import { SimpleDatepicker, ButtonWithLoadingProp } from "../components";
import { format } from "date-fns/esm";

type Props = {
    userId: string;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateAnnouncementsForm: React.FunctionComponent<Props> = (
    props: Props
) => {
    const { setLoading } = props;
    const [createAnnouncementResponse, createAnnouncement] = useDynamicFetch<
        undefined,
        CreateAnnouncementJobRequestType
    >("/job/create", undefined, false);
    const [courseData] = useFetch<CourseListResponseType>("/courses/list");

    const [title, setTitle] = React.useState<string>("");
    const [content, setContent] = React.useState<string>("");
    const [courseCodes, setCourseCodes] = React.useState<
        Array<CourseOptionType>
    >([]);
    const [courses, setCourses] = React.useState<Array<CourseOptionType>>([]);
    const [announcementTime, setAnnouncementTime] = React.useState<Date>(
        new Date()
    );

    const isCourseEmpty = React.useMemo(() => {
        return courses.length === 0;
    }, [courses]);

    const isSubmitting: boolean = React.useMemo(() => {
        return requestIsLoading(createAnnouncementResponse);
    }, [createAnnouncementResponse]);

    React.useEffect(() => {
        if (requestIsLoaded(courseData)) {
            const options = courseData.data.map((course) => {
                return { value: course.code, label: course.code };
            });
            setCourseCodes(options);
            setLoading(false);
        }
    }, [courseData, setLoading]);

    return (
        <Container>
            <Form
                className="mb-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    courses.forEach((option) => {
                        createAnnouncement({
                            jobDate: announcementTime.toISOString(),
                            executingEvent: ExecutingEvent.ANNOUNCEMENT,
                            data: {
                                title,
                                content,
                                userId: props.userId,
                                courseCode: option.value,
                            },
                        });
                    });
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
                        disabled={isSubmitting}
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
                    />
                </Form.Group>
                <ButtonWithLoadingProp
                    variant="primary"
                    type="submit"
                    loading={isSubmitting}
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
